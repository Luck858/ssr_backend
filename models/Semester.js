import mongoose from 'mongoose';

const semesterSchema = new mongoose.Schema({
  semesterName: {
    type: String,
    required: true,
    trim: true
  },
  semesterNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  academicYear: {
    type: String,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  year: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4]
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

semesterSchema.index({ department: 1, semesterNumber: 1, academicYear: 1 }, { unique: true });

export default mongoose.model('Semester', semesterSchema);
