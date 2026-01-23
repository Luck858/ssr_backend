import mongoose from 'mongoose';

const StudentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    fullName: String,
    email: String,
    phone: String,
    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },

    semester: Number,
    cgpa: Number,
    about: String,

    profileImage: String,
    cloudinaryId: String,

    skills: [String],
    languages: [String],
    certifications: [String],
    projects: [
      {
        title: String,
        description: String,
        technologies: [String],
        link: String,
      },
    ],
    internships: [
      {
        company: String,
        position: String,
        duration: String,
        description: String,
      },
    ],
    achievements: [String],
    interests: [String],

    linkedin: String,
    github: String,
    twitter: String,
    portfolio: String,
  },
  { timestamps: true }
);

export default mongoose.model('StudentProfile', StudentProfileSchema);
