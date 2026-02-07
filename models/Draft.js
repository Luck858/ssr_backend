import mongoose from 'mongoose';

const draftSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    draftData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['draft', 'submitted'],
      default: 'draft',
    },
    studentDetails: {
      studentName: String,
      fatherName: String,
      motherName: String,
      dateOfBirth: String,
      gender: String,
      email: String,
      mobileNo: String,
    },
    progress: {
      type: Number,
      default: 0,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  { timestamps: true }
);

// TTL index to auto-delete drafts after 30 days
draftSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Draft = mongoose.model('Draft', draftSchema);
export default Draft;
