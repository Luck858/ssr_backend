import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Batch from './Batch.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['principal', 'admin', 'teacher', 'student','coordinator'],
      required: [true, 'Please specify a role'],
    },
    // Reference to Department collection
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: function() { return this.role === 'student' || this.role === 'teacher'; }
    },
    // Reference to Batch collection
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: function() { return this.role === 'student'; }
    },
    phone: {
      type: String,
      trim: true,
    },
    joiningYear: {
      type: Number,
      trim: true,
      required: function() { return this.role === 'teacher'; }
    },
    designation: {
      type: String,
      trim: true,
      required: false,
    },
    dob: {
      type: Date,
      required: false,
    },
    photo: {
      type: String,
      required: false,
    },
    bloodGroup: {
      type: String,
      required: false,
    },
    officialDetails: {
      type: String,
      required: false,
    },
    panNumber: {
      type: String,
      required: false,
    },
    aadhaarNumber: {
      type: String,
      required: false,
    },
    salary: {
      type: Number,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    remarks: {
      type: String,
      required: false,
    },
    post: {
      type: String,
      required: false,
    },
    section: {
      type: String,
      trim: true,
      required: function() { return this.role === 'student'; }
    },
    enrollmentId: {
      type: String,
      trim: true,
    },
    employeeId: {
      type: String,
      trim: true,
    },
    canRegisterStudents: {
      type: Boolean,
      default: false,
    },
    isCoordinator: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password when sending user object
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
