import FacultyProfile from '../models/FacultyProfile.js';

// Get faculty profile by profile ID
export const getFacultyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching profile for ID:", id);

    const profile = await FacultyProfile.findOne({user:id}).populate('user department');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Get faculty profile by user ID
export const getFacultyProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await FacultyProfile.findOne({ user: userId }).populate(
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

// Create faculty profile
export const createFacultyProfile = async (req, res) => {
  try {
    const {
      user,
      fullName,
      designation,
      department,
      email,
      phone,
      employeeId,
      about,
      qualifications,
      experienceYears,
      subjects,
      researchInterests,
      publications,
      achievements,
      linkedin,
      github,
      twitter,
      website,
    } = req.body;

    // Check if profile already exists for this user
    const existingProfile = await FacultyProfile.findOne({ user });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists for this user' });
    }

    const profile = new FacultyProfile({
      user,
      fullName,
      designation,
      department,
      email,
      phone,
      employeeId,
      about,
      qualifications: qualifications || [],
      experienceYears,
      subjects: subjects || [],
      researchInterests: researchInterests || [],
      publications: publications || [],
      achievements: achievements || [],
      linkedin,
      github,
      twitter,
      website,
    });

    await profile.save();
    res.status(201).json({ message: 'Profile created successfully', profile });
  } catch (error) {
    res.status(500).json({ message: 'Error creating profile', error: error.message });
  }
};

// Update faculty profile
export const updateFacultyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const profile = await FacultyProfile.findOneAndUpdate({user:id}, updateData, {
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

// Get all faculty profiles (with pagination)
export const getAllFacultyProfiles = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const profiles = await FacultyProfile.find()
      .populate('user department')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await FacultyProfile.countDocuments();

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

// Delete faculty profile
export const deleteFacultyProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await FacultyProfile.findByIdAndDelete(id);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting profile', error: error.message });
  }
};
