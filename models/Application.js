import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
      required: true,
    },
    studentDetails: {
      studentName: String,
      fatherName: String,
      motherName: String,
      dateOfBirth: String,
      gender: String,
      aadharNumber: String,
      bloodGroup: String,
      interHallTicketNo: String,
      interGroup: String,
      tenthHallTicketNo: String,
    },
    addressDetails: {
      houseNo: String,
      street: String,
      village: String,
      mandal: String,
      district: String,
      secretariatSachivalayam: String,
      pinCode: String,
    },
    contactDetails: {
      mobileNo: String,
      parentsContactNo: String,
      guardianContactNo: String,
      email: String,
    },
    otherDetails: {
      religion: String,
      category: String,
      caste: String,
      physicallyChallenged: String,
      casteCertificateMeeSevaNa: String,
      incomeCertificateMeeSevaNa: String,
      ewsMeeSevaNa: String,
      rationCardNo: String,
      riceCardNo: String,
      motherAadhar: String,
      bankName: String,
      bankIFSC: String,
      bankAccountNo: String,
    },
    uploadedFiles: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    studyDetails: [
      {
        sNo: Number,
        schoolCollegeName: String,
        academicYear: String,
        class: String,
        place: String,
      },
    ],
    preferences: {
      secondLanguage: String,
      degreeGroup: String,
      bscSpecializations: [String],
      collegePreferences: [String],
    },
    signatureUpload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    officeUseOnly: {
  applicationFeePaid: String,
  studentIdGenerated: String,
  portalNumber: String,

  // ✅ ADD THESE
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
  },
  section: String,

  // ✅ ADD THIS
  studentAccountCreated: {
    type: Boolean,
    default: false,
  },

  onlineApplicationPassword: String,
  appliedOnlinePart1: String,
  collegeOptionsEntered: String,
  collegeAllotmentStatus: String,
},

    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'draft',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


export default mongoose.model('Application', applicationSchema);