import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Fee', feeSchema);
