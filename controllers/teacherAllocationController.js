import TeacherAllocation from '../models/TeacherAllocation.js';

export const createAllocation = async (req, res) => {
  try {
    const allocation = new TeacherAllocation(req.body);
    await allocation.save();

    const populatedAllocation = await TeacherAllocation.findById(allocation._id)
      .populate('teacher', 'name email department')
      .populate('subject', 'subjectName subjectCode')
      .populate('department', 'departmentName departmentId')
      .populate('batch', 'batchName');

    res.status(201).json({ success: true, data: populatedAllocation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllAllocations = async (req, res) => {
  try {
    const { teacher, department, batch, academicYear } = req.query;
    const filter = { isActive: true };
    console.log(department, batch, academicYear);

    if (teacher) filter.teacher = teacher;
    if (department) filter.department = department;
    if (batch) filter.batch = batch;
    if (academicYear) filter.academicYear = academicYear;

    const allocations = await TeacherAllocation.find(filter)
      .populate('teacher', 'name email department')
      .populate('subject', 'subjectName subjectCode')
      .populate('department', 'departmentName departmentId')
      .populate('batch', 'batchName')
      .sort({ year: 1, section: 1 });

    res.json({ success: true, data: allocations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllocationsByTeacher = async (req, res) => {
  try {
    const allocations = await TeacherAllocation.find({
      teacher: req.params.teacherId,
      isActive: true
    })
      .populate('subject', 'subjectName subjectCode')
      .populate('department', 'departmentName departmentId')
      .populate('batch', 'batchName')
      .sort({ year: 1, section: 1 });

    res.json({ success: true, data: allocations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllocationById = async (req, res) => {
  try {
    const allocation = await TeacherAllocation.findById(req.params.id)
      .populate('teacher', 'name email department')
      .populate('subject', 'subjectName subjectCode')
      .populate('department', 'departmentName departmentId')
      .populate('batch', 'batchName');

    if (!allocation) {
      return res.status(404).json({ success: false, error: 'Allocation not found' });
    }

    res.json({ success: true, data: allocation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateAllocation = async (req, res) => {
  try {
    const allocation = await TeacherAllocation.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate('teacher', 'name email department')
      .populate('subject', 'subjectName subjectCode')
      .populate('department', 'departmentName departmentId')
      .populate('batch', 'batchName');

    if (!allocation) {
      return res.status(404).json({ success: false, error: 'Allocation not found' });
    }

    res.json({ success: true, data: allocation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteAllocation = async (req, res) => {
  try {
    const allocation = await TeacherAllocation.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!allocation) {
      return res.status(404).json({ success: false, error: 'Allocation not found' });
    }

    res.json({ success: true, message: 'Allocation removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
