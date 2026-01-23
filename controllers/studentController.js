import StudentProfile from '../models/StudentProfile.js';
import cloudinary from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get student profile
export const getStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user=id;
    

    const profile = await StudentProfile.find({user:user}).populate('user department');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Get student profile by user ID
export const getStudentProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await StudentProfile.findOne({ user: userId }).populate(
      'user department'
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Create student profile
export const createStudentProfile = async (req, res) => {
  try {
    const {
      user,
      fullName,
      email,
      phone,
      studentId,
      department,
      semester,
      cgpa,
      about,
      skills,
      languages,
      certifications,
      projects,
      internships,
      achievements,
      interests,
      linkedin,
      github,
      twitter,
      portfolio,
    } = req.body;

    // Check if profile already exists for this user
    const existingProfile = await StudentProfile.findOne({ user });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists for this user' });
    }

    const profile = new StudentProfile({
      user,
      fullName,
      email,
      phone,
      studentId,
      department,
      semester,
      cgpa,
      about,
      skills: skills || [],
      languages: languages || [],
      certifications: certifications || [],
      projects: projects || [],
      internships: internships || [],
      achievements: achievements || [],
      interests: interests || [],
      linkedin,
      github,
      twitter,
      portfolio,
    });

    await profile.save();
    res.status(201).json({ message: 'Profile created successfully', profile });
  } catch (error) {
    res.status(500).json({ message: 'Error creating profile', error: error.message });
  }
};

// Update student profile
export const updateStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const profile = await StudentProfile.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('user department');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Convert buffer to base64
    const base64 = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.v2.uploader.upload(dataURI, {
      folder: 'student_profiles',
      resource_type: 'auto',
    });

    res.status(200).json({
      message: 'Image uploaded successfully',
      url: result.secure_url,
      cloudinaryId: result.public_id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
};

// Delete profile image
export const deleteProfileImage = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await StudentProfile.findById(id);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (profile.cloudinaryId) {
      await cloudinary.v2.uploader.destroy(profile.cloudinaryId);
    }

    profile.profileImage = null;
    profile.cloudinaryId = null;
    await profile.save();

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
};

// Get all student profiles (with pagination)
export const getAllStudentProfiles = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, semester } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = semester;

    const profiles = await StudentProfile.find(filter)
      .populate('user department')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await StudentProfile.countDocuments(filter);

    res.status(200).json({
      profiles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProfiles: total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profiles', error: error.message });
  }
};

// Delete student profile
export const deleteStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await StudentProfile.findByIdAndDelete(id);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Delete image from Cloudinary if exists
    if (profile.cloudinaryId) {
      await cloudinary.v2.uploader.destroy(profile.cloudinaryId);
    }

    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting profile', error: error.message });
  }
};
