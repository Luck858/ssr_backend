import Attendance from '../models/Attendance.js';

export const createAttendance = async (req, res) => {
  try {
    const { attendanceRecords } = req.body;

    let presentCount = 0;
    let absentCount = 0;

    attendanceRecords.forEach(record => {
      if (record.status === 'Present') presentCount++;
      if (record.status === 'Absent') absentCount++;
    });

    const attendanceData = {
      ...req.body,
      presentCount,
      absentCount,
      totalStudents: attendanceRecords.length
    };

    const attendance = new Attendance(attendanceData);
    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('timetable')
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name email')
      .populate('department', 'departmentName')
      .populate('batch', 'batchName')
      .populate('attendanceRecords.student', 'name email');

    res.status(201).json({ success: true, data: populatedAttendance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const { teacher, subject, batch, section, date, academicYear } = req.query;
    const filter = {};

    if (teacher) filter.teacher = teacher;
    if (subject) filter.subject = subject;
    if (batch) filter.batch = batch;
    if (section) filter.section = section;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }
    if (academicYear) filter.academicYear = academicYear;

    const attendances = await Attendance.find(filter)
      .populate('timetable')
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name email')
      .populate('department', 'departmentName')
      .populate('batch', 'batchName')
      .populate('attendanceRecords.student', 'name email')
      .sort({ date: -1, periodNumber: 1 });

    res.json({ success: true, data: attendances });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStudentAttendance = async (req, res) => {
  try {
    const { subject, startDate, endDate } = req.query;
    const filter = {
      'attendanceRecords.student': req.params.studentId
    };

    if (subject) filter.subject = subject;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const attendances = await Attendance.find(filter)
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name')
      .sort({ date: -1 });

    const studentAttendance = attendances.map(att => {
      const record = att.attendanceRecords.find(
        r => r.student.toString() === req.params.studentId
      );
      return {
        _id: att._id,
        subject: att.subject,
        teacher: att.teacher,
        date: att.date,
        periodNumber: att.periodNumber,
        status: record?.status,
        remarks: record?.remarks
      };
    });

    const summary = {
      total: studentAttendance.length,
      present: studentAttendance.filter(a => a.status === 'Present').length,
      absent: studentAttendance.filter(a => a.status === 'Absent').length,
      late: studentAttendance.filter(a => a.status === 'Late').length,
      excused: studentAttendance.filter(a => a.status === 'Excused').length
    };

    res.json({
      success: true,
      data: studentAttendance,
      summary
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getBatchAttendanceReport = async (req, res) => {
  try {
    const { batchId, section } = req.params;
    const { subject, startDate, endDate } = req.query;

    const filter = {
      batch: batchId,
      section: section
    };

    if (subject) filter.subject = subject;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const attendances = await Attendance.find(filter)
      .populate('attendanceRecords.student', 'name email');

    const studentMap = new Map();

    attendances.forEach(att => {
      att.attendanceRecords.forEach(record => {
        const studentId = record.student._id.toString();

        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            student: record.student,
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0
          });
        }

        const stats = studentMap.get(studentId);
        stats.total++;
        if (record.status === 'Present') stats.present++;
        if (record.status === 'Absent') stats.absent++;
        if (record.status === 'Late') stats.late++;
        if (record.status === 'Excused') stats.excused++;
      });
    });

    const report = Array.from(studentMap.values()).map(stats => ({
      ...stats,
      attendancePercentage: stats.total > 0
        ? ((stats.present / stats.total) * 100).toFixed(2)
        : 0
    }));

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('timetable')
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name email')
      .populate('department', 'departmentName')
      .populate('batch', 'batchName')
      .populate('attendanceRecords.student', 'name email');

    if (!attendance) {
      return res.status(404).json({ success: false, error: 'Attendance record not found' });
    }

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const { attendanceRecords } = req.body;

    let presentCount = 0;
    let absentCount = 0;

    attendanceRecords.forEach(record => {
      if (record.status === 'Present') presentCount++;
      if (record.status === 'Absent') absentCount++;
    });

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        presentCount,
        absentCount,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    )
      .populate('timetable')
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name email')
      .populate('attendanceRecords.student', 'name email');

    if (!attendance) {
      return res.status(404).json({ success: false, error: 'Attendance record not found' });
    }

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
