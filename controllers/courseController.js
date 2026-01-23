import Course from '../models/Course.js';

export const createCourse = async (req, res) => {
  try {
    const { courseName, description } = req.body;
    if (!courseName) {
      return res.status(400).json({ success: false, message: 'Course name is required' });
    }

    // create a simple course code by taking initials + a timestamp suffix
    const initials = courseName.split(' ').map(s => s[0]).join('').toUpperCase().slice(0,4);
    const code = `${initials}${Date.now().toString().slice(-4)}`;

    const course = await Course.create({
      courseName,
      courseCode: code,
      description,
      createdBy: req.user && req.user._id,
    });

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ courseName: 1 });
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
