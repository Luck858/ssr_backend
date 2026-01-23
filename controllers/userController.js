import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, department } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (department) user.department = department;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await User.findById(id)
      .select('-password')
      .populate('batch', 'batchName startDate endDate')
      .populate('department', 'departmentName');

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};




// GET /api/user?role=student&batch=<id>&section=<section>&limit=...&page=...&search=...
export const getUsers = async (req, res) => {
  try {
    const { role, batch, section, department, limit, page, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (batch) filter.batch = batch;
    if (section) filter.section = section; console.log(section)
    if (department) filter.department = department;

    if (search) {
      const q = new RegExp(search, 'i');
      filter.$or = [{ name: q }, { email: q }, { enrollmentId: q }, { employeeId: q }];
    }

    const perPage = parseInt(limit, 10) || 0;
    const currentPage = parseInt(page, 10) || 1;
    const skip = perPage ? (currentPage - 1) * perPage : 0;

    let query = User.find(filter)
      .select('-password')
      .populate('batch', 'batchName startDate endDate')
      .populate('department', 'departmentName');

    if (perPage) query = query.limit(perPage).skip(skip);

    const users = await query.exec();

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
