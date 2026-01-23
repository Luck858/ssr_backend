import mongoose from 'mongoose';

const FacultyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    fullName: String,
    designation: String,

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },

    email: String,
    phone: String,
    employeeId: String,

    about: String,
    qualifications: [String],
    experienceYears: Number,

    subjects: [String],
    researchInterests: [String],
    publications: [String],
    achievements: [String],

    linkedin: String,
    github: String,
    twitter: String,
    website: String,

    profileImage: String,
    dob: Date,
    bloodGroup: String,
    officialDetails: String,
    panNumber: String,
    aadhaarNumber: String,
    salary: Number,
    address: String,
    remarks: String,
    post: String,
    cloudinaryId: String,
  },
  { timestamps: true }
);

export default mongoose.model('FacultyProfile', FacultyProfileSchema);
