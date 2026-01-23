import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
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
  section: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D']
  },
  year: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4]
  },
  dayOfWeek: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  periodNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherAllocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherAllocation',
    required: true
  },
  roomNumber: {
    type: String,
    trim: true
  },
  academicYear: {
    type: String,
    required: true
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

timetableSchema.index({ batch: 1, section: 1, dayOfWeek: 1, periodNumber: 1 }, { unique: true });

export default mongoose.model('Timetable', timetableSchema);
