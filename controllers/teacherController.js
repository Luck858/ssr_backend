import User from '../models/User.js';
import Batch from '../models/Batch.js';
import Department from '../models/Departement.js';

// ===================== REGISTER STUDENT =====================
export const teacherRegisterStudent = async (req, res) => {
  try {
    const { name, email, password, batch, department, phone, enrollmentId } = req.body;

    // Validation
    if (!name || !email || !password || !batch || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password, batch, department)',
      });
    }

    // Check batch exists
    const batchObj = await Batch.findById(batch);
    if (!batchObj) return res.status(404).json({ success: false, message: 'Batch not found' });

    // Check department exists in batch
    const deptInBatch = batchObj.departments.find(
      (d) => d.departmentId.toString() === department
    );
    if (!deptInBatch) {
      return res.status(400).json({
        success: false,
        message: 'Selected department does not belong to this batch',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create student
    const student = await User.create({
      name,
      email,
      password,
      role: 'student',
      batch,
      department,
      phone,
      enrollmentId,
      createdBy: req.user._id, // teacher id
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: student,
    });
  } catch (error) {
    console.error('Error in teacherRegisterStudent:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// ===================== GET MY STUDENTS =====================
export const getMyStudents = async (req, res) => {
  try {
    const students = await User.find({ createdBy: req.user._id, role: 'student' })
      .populate({
        path: 'batch',
        select: 'batchName', // ensure batchName is included
      })
      .populate({
        path: 'department',
        select: 'departmentName departmentId', // ensure departmentName is included
      })
      .lean(); // optional but makes it cleaner JSON

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error('Error fetching my students:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

