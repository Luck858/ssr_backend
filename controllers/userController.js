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
      .populate('semester', 'semesterName')
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

// GET /api/admin/users-with-photos - Fetch all users with photos for gallery
export const getUsersWithPhotos = async (req, res) => {
  try {
    const { limit = 50, page = 1, role } = req.query;

    const filter = {
      photo: { $exists: true, $ne: null } // Only users with photos
    };
    
    if (role) {
      filter.role = role;
    }

    const perPage = parseInt(limit, 10) || 50;
    const currentPage = parseInt(page, 10) || 1;
    const skip = (currentPage - 1) * perPage;

    const users = await User.find(filter)
      .select('name email role photo createdAt department designatio bloodGroup')
      .populate('department', 'departmentName')
      .sort({ createdAt: -1 })
      .limit(perPage)
      .skip(skip)
      .exec();

    const total = await User.countDocuments(filter);

    res.status(200).json({ 
      success: true, 
      data: users,
      pagination: {
        total,
        page: currentPage,
        pages: Math.ceil(total / perPage),
        limit: perPage
      }
    });
  } catch (error) {
    console.error('Error fetching users with photos:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/public/faculty - Public endpoint for faculty directory (no auth required)
export const getPublicFaculty = async (req, res) => {
  try {
    const { limit = 500, page = 1 } = req.query;

    const filter = {
      role: 'teacher',
      photo: { $exists: true, $ne: null } // Only teachers with photos
    };

    const perPage = parseInt(limit, 10) || 500;
    const currentPage = parseInt(page, 10) || 1;
    const skip = (currentPage - 1) * perPage;

    const users = await User.find(filter)
      .select('name email role photo createdAt department designation bloodGroup')
      .populate('department', 'departmentName')
      .sort({ createdAt: -1 })
      .limit(perPage)
      .skip(skip)
      .exec();

    const total = await User.countDocuments(filter);

    res.status(200).json({ 
      success: true, 
      data: users,
      pagination: {
        total,
        page: currentPage,
        pages: Math.ceil(total / perPage),
        limit: perPage
      }
    });
  } catch (error) {
    console.error('Error fetching public faculty:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
