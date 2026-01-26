import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
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
  amount: {
    type: Number,
    required: true
  }
}, { timestamps: true });

// Create a compound unique index to prevent duplicate fees
feeSchema.index({ course: 1, department: 1, batch: 1, semester: 1, academicYear: 1 }, { unique: true });

export default mongoose.model('Fee', feeSchema);
