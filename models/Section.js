import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  sectionName: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D', 'E', 'F'],
    trim: true
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
  year: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4]
  },
  academicYear: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    default: 60
  },
  isActive: {
    type: Boolean,
    default: true
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

sectionSchema.index({ department: 1, batch: 1, sectionName: 1, academicYear: 1 }, { unique: true });

export default mongoose.model('Section', sectionSchema);
