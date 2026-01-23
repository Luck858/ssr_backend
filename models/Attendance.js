import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Present', 'Absent', 'Late', 'Excused'],
    default: 'Absent'
  },
  remarks: {
    type: String,
    trim: true
  }
});

const attendanceSchema = new mongoose.Schema({
  timetable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable',
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
  date: {
    type: Date,
    required: true
  },
  periodNumber: {
    type: Number,
    required: true
  },
  attendanceRecords: [attendanceRecordSchema],
  totalStudents: {
    type: Number,
    required: true
  },
  presentCount: {
    type: Number,
    default: 0
  },
  absentCount: {
    type: Number,
    default: 0
  },
  academicYear: {
    type: String,
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  markedAt: {
    type: Date,
    default: Date.now
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

attendanceSchema.index({ timetable: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
