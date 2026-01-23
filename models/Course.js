import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: [true, 'Please add a course name'],
    trim: true,
    unique: true,
  },
  courseCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    maxlength: [500, 'Description can not be more than 500 characters'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
export default Course;
