import Timetable from '../models/TimeTable.js';

export const createTimetable = async (req, res) => {
  try {
    const timetable = new Timetable(req.body);
    await timetable.save();

    const populatedTimetable = await Timetable.findById(timetable._id)
      .populate('department', 'departmentName departmentId')
      .populate('batch', 'batchName')
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name email')
      .populate('teacherAllocation');

    res.status(201).json({ success: true, data: populatedTimetable });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllTimetables = async (req, res) => {
  try {
    const { department, batch, section, year, dayOfWeek, teacher, academicYear } = req.query;
    const filter = { isActive: true };

    if (department) filter.department = department;
    if (batch) filter.batch = batch;
    if (section) filter.section = section;
    if (year) filter.year = parseInt(year);
    if (dayOfWeek) filter.dayOfWeek = dayOfWeek;
    if (teacher) filter.teacher = teacher;
    if (academicYear) filter.academicYear = academicYear;

    const timetables = await Timetable.find(filter)
      .populate('department', 'departmentName departmentId')
      .populate('batch', 'batchName')
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name email')
      .sort({ dayOfWeek: 1, periodNumber: 1 });

    res.json({ success: true, data: timetables });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTimetableByBatchSection = async (req, res) => {
  try {
    const { batchId, section } = req.params;

    const timetables = await Timetable.find({
      batch: batchId,
      section: section,
      isActive: true
    })
      .populate('department', 'departmentName departmentId')
      .populate('batch', 'batchName')
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name email')
      .sort({ dayOfWeek: 1, periodNumber: 1 });

    const grouped = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    days.forEach(day => {
      grouped[day] = timetables.filter(t => t.dayOfWeek === day);
    });

    res.json({ success: true, data: grouped });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTimetableByTeacher = async (req, res) => {
  try {
    const timetables = await Timetable.find({
      teacher: req.params.teacherId,
      isActive: true
    })
    
      .populate('department', 'departmentName departmentId')
      .populate('batch', 'batchName')
      .populate('subject', 'subjectName subjectCode')
      .sort({ dayOfWeek: 1, periodNumber: 1 });

    const grouped = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    days.forEach(day => {
      grouped[day] = timetables.filter(t => t.dayOfWeek === day);
    });

    res.json({ success: true, data: grouped });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTimetableById = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('department', 'departmentName departmentId')
      .populate('batch', 'batchName')
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name email')
      .populate('teacherAllocation');

    if (!timetable) {
      return res.status(404).json({ success: false, error: 'Timetable entry not found' });
    }

    res.json({ success: true, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate('department', 'departmentName departmentId')
      .populate('batch', 'batchName')
      .populate('subject', 'subjectName subjectCode')
      .populate('teacher', 'name email');

    if (!timetable) {
      return res.status(404).json({ success: false, error: 'Timetable entry not found' });
    }

    res.json({ success: true, data: timetable });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!timetable) {
      return res.status(404).json({ success: false, error: 'Timetable entry not found' });
    }

    res.json({ success: true, message: 'Timetable entry removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
