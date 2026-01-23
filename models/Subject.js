import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  subjectCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
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
  semester: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5, 6, 7, 8]
  },
  credits: {
    type: Number,
    default: 3
  },
  subjectType: {
    type: String,
    enum: ['Theory', 'Practical', 'Lab', 'Project', 'Elective'],
    default: 'Theory'
  },
  description: {
    type: String,
    trim: true
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

export default mongoose.model('Subject', subjectSchema);
