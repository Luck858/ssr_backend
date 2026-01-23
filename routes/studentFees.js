import express from 'express';
import Student from '../models/Student.js';
import Fee from '../models/Fee.js';

const router = express.Router();

// ✅ Get students by department and batch
router.get('/', async (req, res) => {
  try {
    const { department, batch } = req.query;

    if (!department || !batch) {
      return res.status(400).json({ success: false, message: "Department and batch are required" });
    }

    const students = await Student.find({ department, batch })
      .populate("department", "departmentName")
      .populate("batch", "batchName")
      .populate("fees.fee", "amount description"); // populate assigned fees if stored in student schema

    res.json({ success: true, students });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ success: false, message: "Error fetching students" });
  }
});

// ✅ Update student fee (apply concession/discount)
router.put('/:studentId/fee/:feeId', async (req, res) => {
  try {
    const { studentId, feeId } = req.params;
    const { amount } = req.body;

    if (!amount) return res.status(400).json({ success: false, message: "Amount is required" });

    const student = await Student.findById(studentId);

    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    // Assuming student.fees is an array of fee assignments
    const feeItem = student.fees.find(f => f.fee.toString() === feeId);

    if (!feeItem) return res.status(404).json({ success: false, message: "Fee record not found for student" });

    feeItem.amount = amount; // update with concession/discount
    await student.save();

    res.json({ success: true, message: "Fee updated successfully", student });
  } catch (err) {
    console.error("Error updating student fee:", err);
    res.status(500).json({ success: false, message: "Error updating student fee" });
  }
});

export default router;
