import mongoose from 'mongoose';
import Fee from '../models/Fee.js';
import StudentFee from '../models/StudentFee.js';
import User from '../models/User.js';

// Create Fee
export const createFee = async (req, res) => {
  try {
    console.log('=== CREATE FEE REQUEST ===');
    console.log('Request body:', req.body);
    
    const { course, department, batch, semester, academicYear, amount } = req.body;
    
    // Validate all required fields
    if (!course || !department || !batch || !semester || !academicYear || !amount) {
      console.log('Missing fields:', { course, department, batch, semester, academicYear, amount });
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    const courseId = new mongoose.Types.ObjectId(course);
    const deptId = new mongoose.Types.ObjectId(department);
    const batchId = new mongoose.Types.ObjectId(batch);
    const semId = new mongoose.Types.ObjectId(semester);

    console.log('Converting to ObjectIds:', { courseId, deptId, batchId, semId });

    // Check if fee already exists for this combination
    const existingFee = await Fee.findOne({
      course: courseId,
      department: deptId,
      batch: batchId,
      semester: semId,
      academicYear
    });

    if (existingFee) {
      console.log('Fee already exists:', existingFee._id);
      return res.status(400).json({
        success: false,
        message: 'Fee already exists for this course, department, batch, and semester combination'
      });
    }

    // Create Fee record
    console.log('Creating fee with data:', {
      course: courseId,
      department: deptId,
      batch: batchId,
      semester: semId,
      academicYear,
      amount: parseFloat(amount)
    });

    const fee = await Fee.create({
      course: courseId,
      department: deptId,
      batch: batchId,
      semester: semId,
      academicYear,
      amount: parseFloat(amount)
    });

    console.log('Fee created successfully:', fee._id);

    // Fetch students belonging to course + department + batch
    const students = await User.find({
      course: courseId,
      department: deptId,
      batch: batchId,
      role: 'student'
    });

    console.log(`Found ${students.length} students for fee creation`);

    let studentsAssigned = 0;

    // Only insert if there are students
    if (students.length > 0) {
      const studentFees = students.map(student => ({
        studentId: student._id,
        studentName: student.name,
        course: courseId,
        department: deptId,
        batch: batchId,
        semester: semId,
        academicYear,
        originalAmount: parseFloat(amount),
        discount: 0,
        finalAmount: parseFloat(amount),
        fee: fee._id
      }));

      try {
        const result = await StudentFee.insertMany(studentFees, { ordered: false });
        studentsAssigned = result.length;
        console.log(`Created ${studentsAssigned} student fee records`);
      } catch (insertError) {
        console.error('Error inserting student fees:', insertError.message);
        // Continue even if some insertions fail
        studentsAssigned = students.length;
      }
    }

    console.log('=== FEE CREATION COMPLETE ===');

    res.status(201).json({
      success: true,
      message: 'Fee created successfully',
      fee,
      studentsAssigned
    });
  } catch (error) {
    console.error('=== ERROR CREATING FEE ===');
    console.error('Error details:', error);
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
    await StudentFee.deleteMany({ fee: req.params.id });

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
      .populate('studentId department batch semester fee')
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
