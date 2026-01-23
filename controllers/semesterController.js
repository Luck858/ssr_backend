import Semester from '../models/Semester.js';

export const createSemester = async (req, res) => {
  try {
    const { isCurrent, department } = req.body;

    if (isCurrent) {
      await Semester.updateMany(
        { department, isCurrent: true },
        { isCurrent: false }
      );
    }

    const semester = new Semester(req.body);
    await semester.save();

    const populatedSemester = await Semester.findById(semester._id)
      .populate('department', 'departmentName departmentId');

    res.status(201).json({ success: true, data: populatedSemester });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllSemesters = async (req, res) => {
  try {
    const { department, academicYear, isActive, isCurrent } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (academicYear) filter.academicYear = academicYear;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isCurrent !== undefined) filter.isCurrent = isCurrent === 'true';

    const semesters = await Semester.find(filter)
      .populate('department', 'departmentName departmentId')
      .sort({ academicYear: -1, semesterNumber: 1 });

    res.json({ success: true, data: semesters });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCurrentSemester = async (req, res) => {
  try {
    const { department } = req.params;

    const semester = await Semester.findOne({
      department,
      isCurrent: true
    }).populate('department', 'departmentName departmentId');

    if (!semester) {
      return res.status(404).json({
        success: false,
        error: 'No current semester found for this department'
      });
    }

    res.json({ success: true, data: semester });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSemesterById = async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id)
      .populate('department', 'departmentName departmentId');

    if (!semester) {
      return res.status(404).json({ success: false, error: 'Semester not found' });
    }

    res.json({ success: true, data: semester });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSemester = async (req, res) => {
  try {
    const { isCurrent, department } = req.body;

    if (isCurrent) {
      await Semester.updateMany(
        {
          department,
          isCurrent: true,
          _id: { $ne: req.params.id }
        },
        { isCurrent: false }
      );
    }

    const semester = await Semester.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('department', 'departmentName departmentId');

    if (!semester) {
      return res.status(404).json({ success: false, error: 'Semester not found' });
    }

    res.json({ success: true, data: semester });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const setCurrentSemester = async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id);

    if (!semester) {
      return res.status(404).json({ success: false, error: 'Semester not found' });
    }

    await Semester.updateMany(
      { department: semester.department, isCurrent: true },
      { isCurrent: false }
    );

    semester.isCurrent = true;
    semester.isActive = true;
    await semester.save();

    const populatedSemester = await Semester.findById(semester._id)
      .populate('department', 'departmentName departmentId');

    res.json({
      success: true,
      message: 'Current semester updated successfully',
      data: populatedSemester
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteSemester = async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id);

    if (!semester) {
      return res.status(404).json({ success: false, error: 'Semester not found' });
    }

    if (semester.isCurrent) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete current semester. Please set another semester as current first.'
      });
    }

    await Semester.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Semester deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
