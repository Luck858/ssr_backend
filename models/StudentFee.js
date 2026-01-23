import mongoose from 'mongoose';

const studentFeeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentName: {
      type: String,
      required: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: true
    },
    academicYear: {
      type: String,
      required: true
    },
    originalAmount: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    finalAmount: {
      type: Number,
      required: true
    },
    feeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fee',
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('StudentFee', studentFeeSchema);
