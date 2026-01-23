import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    batchName: { type: String, required: true, trim: true, maxlength: 50 },

// Batch.js
course: {
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  courseName: {
    type: String,
    required: true,
  },
},


    // Branch-wise departments with names
    departments: [
      {
        departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
        departmentName: { type: String, required: true },
        numberOfSections: { type: Number, required: true, min: 1 }
      }
    ],

    // Academic years covered by this batch (e.g. ['2025-2026','2026-2027','2027-2028'])
    academicYears: [{ type: String }],

    startDate: { type: Date },
    endDate: { type: Date }
  },
  { timestamps: true }
);

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;
