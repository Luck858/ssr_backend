import User from '../models/User.js';
import Department from '../models/Departement.js';

export const getAllTeachers = async (req, res) => {
  try {
    const { department } = req.query;
    const filter = { role: 'teacher' };

    if (department) {
      filter.department = department;
    }

    const teachers = await User.find(filter)
      .populate('department', 'departmentName departmentId')
      .sort({ name: 1 });

    res.json({ success: true, data: teachers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllCoordinators = async (req, res) => {
  try {
    const { department } = req.query;
    const filter = { role: 'coordinator' };

    if (department) {
      filter.department = department;
    }

    const coordinators = await User.find(filter)
      .populate('department', 'departmentName departmentId')
      .sort({ name: 1 });

    res.json({ success: true, data: coordinators });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const promoteTeacherToCoordinator = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await User.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' });
    }

    if (teacher.role !== 'teacher') {
      return res.status(400).json({ success: false, error: 'User is not a teacher' });
    }

    teacher.isCoordinator = true;
    await teacher.save();

    const updatedCoordinator = await User.findById(teacher._id)
      .populate('department', 'departmentName departmentId');

    res.json({
      success: true,
      message: `${teacher.name} has been promoted to Coordinator`,
      data: updatedCoordinator
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const demoteCoordinatorToTeacher = async (req, res) => {
  try {
    const { coordinatorId } = req.params;

    const coordinator = await User.findById(coordinatorId);

    if (!coordinator) {
      return res.status(404).json({ success: false, error: 'Coordinator not found' });
    }

    if (coordinator.isCoordinator!== true) { 
      return res.status(400).json({ success: false, error: 'User is not a coordinator' });
    }

    coordinator.isCoordinator = false;
    await coordinator.save();

    const updatedTeacher = await User.findById(coordinator._id)
      .populate('department', 'departmentName departmentId');

    res.json({
      success: true,
      message: `${coordinator.name} has been demoted to Teacher`,
      data: updatedTeacher
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getTeachersAndCoordinators = async (req, res) => {
  try {
    const { department } = req.query;
    const filter = { $or: [{ role: 'teacher' }, { role: 'coordinator' }] };

    if (department) {
      filter.department = department;
    }

    const users = await User.find(filter)
      .populate('department', 'departmentName departmentId')
      .sort({ role: 1, name: 1 });

    const teachers = users.filter(u => u.role === 'teacher' && u.isCoordinator !== true);
    const coordinators = users.filter(u => u.isCoordinator === true);

    res.json({
      success: true,
      data: { teachers, coordinators },
      summary: {
        totalTeachers: teachers.length,
        totalCoordinators: coordinators.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ departmentName: 1 });
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
