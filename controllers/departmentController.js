import Department from '../models/Departement.js';
import Batch from '../models/Batch.js';
import Course from '../models/Course.js';

export const adminRegisterDepartment = async (req, res) => {
  try {
    const { departmentName, description, departmentImage, course } = req.body;
    console.log(req.body);
    if (!departmentName || !description || !departmentImage || !course) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // validate course exists
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Find the latest department to increment the ID
    const latestDepartment = await Department.findOne().sort({ departmentId: -1 });
    let nextDepartmentId;

    if (latestDepartment) {
      const lastId = latestDepartment.departmentId;
      const number = parseInt(lastId.slice(3), 10); // Extract number part and parse as integer
      nextDepartmentId = `DEP${String(number + 1).padStart(2, '0')}`; // Increment and pad with leading zeros
    } else {
      nextDepartmentId = 'DEP01'; // Initial ID
    }

    const departmentExists = await Department.findOne({ departmentId: nextDepartmentId });

    if (departmentExists) {
      return res.status(400).json({
        success: false,
        message: 'Department already exists with this ID',
      });
    }

    const departmentData = {
      departmentName,
      departmentId: nextDepartmentId,
      departmentImage,
      description,
      createdBy: req.user.id,
      course: courseDoc._id,
      isActive: true,
    };

    const department = await Department.create(departmentData);

    res.status(201).json({
      success: true,
      message: 'Department registered successfully',
      department: {
        id: department._id,
        name: department.departmentName,
        description: department.description,
        departmentId: department.departmentId,
        departmentImage: department.departmentImage,
        createdAt: department.createdAt,
      },
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

export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({});
    res.status(200).json({
      success: true,
      data: departments,
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

export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    res.status(200).json({
      success: true,
      data: department,
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



export const getAllBatchesByDepartmentId = async (req, res) => {
  try {
    const departmentId = req.params.id;

    const department = await Department.findById(departmentId).populate('batches');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    res.status(200).json({
      success: true,
      data: department.batches,
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