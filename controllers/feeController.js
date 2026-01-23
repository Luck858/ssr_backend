import mongoose from 'mongoose';
import Fee from '../models/Fee.js';
import StudentFee from '../models/StudentFee.js';
import User from '../models/User.js';

// Create Fee
export const createFee = async (req, res) => {
  try {
    const { department, batch, semester, academicYear, amount } = req.body;
    

    const deptId = new mongoose.Types.ObjectId(department);
    const batchId = new mongoose.Types.ObjectId(batch);
    const semId = new mongoose.Types.ObjectId(semester);

    // Create Fee record
    const fee = await Fee.create({
      department: deptId,
      batch: batchId,
      semester: semId,
      academicYear,
      amount
    });

    // Fetch students belonging to department + batch
    const students = await User.find({
      department: deptId,
      batch: batchId,
      role: 'student'
    });

    

    const studentFees = students.map(student => ({
      studentId: student._id,
      studentName: student.name,
      department: deptId,
      batch: batchId,
      semester: semId,
      academicYear,
      originalAmount: amount,
      discount: 0,
      finalAmount: amount,
      feeId: fee._id
    }));

    await StudentFee.insertMany(studentFees);

    res.status(201).json({
      success: true,
      message: 'Fee created successfully',
      fee,
      studentsAssigned: students.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all fees
export const getAllFees = async (req, res) => {
  try {
    const fees = await Fee.find()
      .populate('department batch semester')
      .sort({ createdAt: -1 });

    res.json({ success: true, fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a fee
export const deleteFee = async (req, res) => {
  try {
    await Fee.findByIdAndDelete(req.params.id);
    await StudentFee.deleteMany({ feeId: req.params.id });

    res.json({ success: true, message: 'Fee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get student fees with query filters
export const getStudentFees = async (req, res) => {
  try {
    const { search, department, batch, semester } = req.query;

    const query = {};
    if (search) query.studentName = { $regex: search, $options: 'i' };
    if (department) query.department = department;
    if (batch) query.batch = batch;
    if (semester) query.semester = semester;

    const studentFees = await StudentFee.find(query)
      .populate('studentId department batch semester feeId')
      .sort({ studentName: 1 });

    res.json({ success: true, studentFees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update student fee (amount + discount)
export const updateStudentFee = async (req, res) => {
  try {
    const { originalAmount, discount } = req.body;

    const finalAmount = originalAmount - discount;

    const studentFee = await StudentFee.findByIdAndUpdate(
      req.params.id,
      {
        originalAmount,
        discount,
        finalAmount,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json({ success: true, studentFee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Apply discount
export const applyDiscount = async (req, res) => {
  try {
    const { discount } = req.body;

    const studentFee = await StudentFee.findById(req.params.id);
    if (!studentFee) {
      return res.status(404).json({
        success: false,
        message: 'Student fee not found'
      });
    }

    studentFee.discount = discount;
    studentFee.finalAmount = studentFee.originalAmount - discount;
    studentFee.updatedAt = Date.now();

    await studentFee.save();

    res.json({ success: true, studentFee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
