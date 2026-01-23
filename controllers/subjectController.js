import Subject from '../models/Subject.js';

export const createSubject = async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllSubjects = async (req, res) => {
  try {
    const { department, year, semester } = req.query;
    const filter = { isActive: true };

    if (department) filter.department = department;
    if (year) filter.year = parseInt(year);
    if (semester) filter.semester = parseInt(semester);

    const subjects = await Subject.find(filter)
      .populate('department', 'departmentName departmentId')
      .sort({ year: 1, semester: 1, subjectName: 1 });

    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('department', 'departmentName departmentId');

    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    res.json({ success: true, message: 'Subject deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
