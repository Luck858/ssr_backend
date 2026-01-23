import User from '../models/User.js';
import Fee from '../models/Fee.js';
import StudentFee from '../models/StudentFee.js';
import mongoose from 'mongoose';
import FacultyProfile from "../models/FacultyProfile.js";
import StudentProfile from "../models/StudentProfile.js";


const assignFeesToNewStudent = async (student) => {
  try {
    const fees = await Fee.find({
      department: student.department,
      batch: student.batch
    });

    if (!fees.length) return;

    const studentFees = fees.map(fee => ({
      studentId: student._id,
      studentName: student.name,
      department: student.department,
      batch: student.batch,
      semester: fee.semester,
      academicYear: fee.academicYear,
      originalAmount: fee.amount,
      discount: 0,
      finalAmount: fee.amount,
      feeId: fee._id
    }));

    await StudentFee.insertMany(studentFees);
  } catch (error) {
    console.error("Error assigning fees to new student:", error.message);
  }
};




export const adminRegisterUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      phone,
      enrollmentId,
      joiningYear,
      employeeId,
      canRegisterStudents,
      section,
      batch,
      designation,
      dob,
      photo,
      bloodGroup,
      officialDetails,
      panNumber,
      aadhaarNumber,
      salary,
      address,
      remarks,
      post,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (role === 'admin' || role === 'principal') {
      return res.status(403).json({
        success: false,
        message: 'Cannot create admin or principal accounts through this endpoint',
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const userData = {
      name,
      email,
      password,
      role,
      department,
      phone,
      createdBy: req.user.id,
      isActive: true,
    };
    // optional fields for students
    if (role === 'student') {
      if (enrollmentId) userData.enrollmentId = enrollmentId;
      if (section) userData.section = section;
      if (batch) userData.batch = batch;
    }
    if (role === 'teacher') {
      if (employeeId) userData.employeeId = employeeId;
      if (joiningYear) userData.joiningYear = joiningYear;
      userData.canRegisterStudents = canRegisterStudents === true;
      // optional teacher fields
      if (designation) userData.designation = designation;
      if (dob) userData.dob = dob;
      if (photo) userData.photo = photo;
      if (bloodGroup) userData.bloodGroup = bloodGroup;
      if (officialDetails) userData.officialDetails = officialDetails;
      if (panNumber) userData.panNumber = panNumber;
      if (aadhaarNumber) userData.aadhaarNumber = aadhaarNumber;
      if (salary) userData.salary = salary;
      if (address) userData.address = address;
      if (remarks) userData.remarks = remarks;
      if (post) userData.post = post;
    }

    const user = await User.create(userData);
if (user.role === 'teacher') {
  await FacultyProfile.create({
    user: user._id,
    fullName: user.name,
    designation: user.designation || "Faculty",
    department: user.department,
    email: user.email,
    phone: user.phone,
    employeeId: user.employeeId,
    experienceYears: 0,
    about: "",
    qualifications: [],
    subjects: [],
    researchInterests: [],
    publications: [],
    achievements: [],
    linkedin: "",
    github: "",
    twitter: "",
    website: "",
    profileImage: user.photo || "",
    dob: user.dob || null,
    bloodGroup: user.bloodGroup || "",
    officialDetails: user.officialDetails || "",
    panNumber: user.panNumber || "",
    aadhaarNumber: user.aadhaarNumber || "",
    salary: user.salary || 0,
    address: user.address || "",
    
    remarks: user.remarks || "",
    post: user.post || "",
  });
}
// Auto assign fees if student
if (user.role === 'student') {
  await assignFeesToNewStudent(user);
  // Create a student profile for the newly registered student
  try {
    await StudentProfile.create({
      user: user._id,
      fullName: user.name,
      email: user.email,
      phone: user.phone || '',
      studentId: user.enrollmentId || '',
      department: user.department || null,
      batch: user.batch || '',
      semester: user.semester || null,
      cgpa: 0,
      about: "",
      skills: [],
      languages: [],
      certifications: [],
      projects: [],
      internships: [],
      achievements: [],
      interests: [],
      linkedin: "",
      github: "",
      twitter: "",
      portfolio: "",
      profileImage: user.photo || "",
    });
  } catch (err) {
    console.error('Error creating StudentProfile for new user:', err.message);
  }
}


    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        enrollmentId: user.enrollmentId,
        section: user.section,
        batch: user.batch,
        employeeId: user.employeeId,
        canRegisterStudents: user.canRegisterStudents,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const teacherRegisterStudent = async (req, res) => {
  try {
    const { name, email, password, batch, department, phone, enrollmentId, section } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Student already exists with this email',
      });
    }

    const student = await User.create({
      name,
      email,
      password,
      batch,
      role: 'student',
      department,
      section,
      phone,
      enrollmentId,
      createdBy: req.user.id,
      isActive: true,
    });

    await assignFeesToNewStudent(student);

    // Create student profile for teacher-registered student
    try {
      await StudentProfile.create({
        user: student._id,
        fullName: student.name,
        email: student.email,
        phone: student.phone || '',
        studentId: student.enrollmentId || '',
        department: student.department || null,
        batch: student.batch || '',
        semester: student.semester || null,
        cgpa: 0,
        about: "",
        skills: [],
        languages: [],
        certifications: [],
        projects: [],
        internships: [],
        achievements: [],
        interests: [],
        linkedin: "",
        github: "",
        twitter: "",
        portfolio: "",
        profileImage: student.photo || "",
      });
    } catch (err) {
      console.error('Error creating StudentProfile for teacher-registered student:', err.message);
    }

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        department: student.department,
        section: student.section,
        phone: student.phone,
        enrollmentId: student.enrollmentId,
        createdAt: student.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const toggleTeacherPermission = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'Only teachers can have student registration permissions',
      });
    }

    user.canRegisterStudents = !user.canRegisterStudents;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Student registration permission ${user.canRegisterStudents ? 'granted' : 'revoked'}`,
      canRegisterStudents: user.canRegisterStudents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role, department, search, page = 1, limit = 50 } = req.query;

    const query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .populate('createdBy', 'name email')
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    const stats = {
      total: await User.countDocuments(),
      students: await User.countDocuments({ role: 'student' }),
      teachers: await User.countDocuments({ role: 'teacher' }),
      admins: await User.countDocuments({ role: 'admin' }),
      principals: await User.countDocuments({ role: 'principal' }),
    };

    res.status(200).json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const getMyStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: 'student',
      createdBy: req.user.id,
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      students,
      total: students.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
