import Application from '../models/Application.js';
import Counter from '../models/Counter.js';

// Prevent duplicate submissions by Aadhar number

const pad = (num, size) => {
  let s = String(num);
  while (s.length < size) s = '0' + s;
  return s;
};

// Generate application id using teacher employeeId (if available) + year + 4-digit atomic sequence
// Fallback to a PUBLIC prefix when no authenticated teacher is present (public submissions)
const generateApplicationId = async (req) => {
  const year = new Date().getFullYear();
  console.log(req.user);
  // prefer authenticated teacher employeeId, otherwise use PUBLIC
  const teacherId = (req && req.user && req.user.employeeId) ? req.user.employeeId : 'PUBLIC';
  console.log(teacherId);

  // Use a counter document per year for atomic increment
  const counterId = `applications_${year}`;
  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seq = pad(counter.seq, 4);
  return `SSR-${teacherId}-${year}-${seq}`;
};

export const createApplication = async (req, res) => {
  try {
    const {
      studentDetails,
      addressDetails,
      contactDetails,
      otherDetails,
      uploadedFiles,
      studyDetails,
      preferences,
      signatureUpload,
    } = req.body;

    // normalize possible aadhar field names
    const aadharNumber = studentDetails?.aadharNumber || studentDetails?.aadhar || studentDetails?.aadharNo || studentDetails?.adharNo;

    // If Aadhar provided, check for existing application with same Aadhar
    if (aadharNumber) {
      const existing = await Application.findOne({ 'studentDetails.aadharNumber': aadharNumber });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'User already registered with this Aadhar number',
        });
      }
    }

    const applicationId = await generateApplicationId(req);

    const application = new Application({
      applicationId,
      studentDetails,
      addressDetails,
      contactDetails,
      otherDetails,
      uploadedFiles,
      studyDetails,
      preferences,
      signatureUpload,
      status: 'submitted',
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId,
      data: application,
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating application',
      error: error.message,
    });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications.map((app) => ({
        applicationId: app.applicationId,
        studentName: app.studentDetails.studentName,
        mobileNo: app.contactDetails.mobileNo,
        gender: app.studentDetails.gender,
        status: app.status,
        createdAt: app.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message,
    });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.find({applicationId: id});

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message,
    });
  }
};

export const updateOfficeUseOnly = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const officeUseData = req.body;

    // 1️⃣ Fetch existing application
    const application = await Application.findOne({ applicationId });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // 2️⃣ Determine new status
    let newStatus = application.status;
    if (typeof officeUseData.studentIdGenerated !== 'undefined') {
      newStatus =
        officeUseData.studentIdGenerated &&
        officeUseData.studentIdGenerated.trim() !== ''
          ? 'approved'
          : 'submitted';
    }

    // 3️⃣ MERGE officeUseOnly (VERY IMPORTANT)
    const updatedOfficeUseOnly = {
      ...(application.officeUseOnly || {}),
      ...officeUseData,
    };

    // 4️⃣ Update application
    const updatedApplication = await Application.findOneAndUpdate(
      { applicationId },
      {
        officeUseOnly: updatedOfficeUseOnly,
        status: newStatus,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Office use data updated successfully',
      data: updatedApplication,
    });
  } catch (error) {
    console.error('Error updating office use data:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating office use data',
      error: error.message,
    });
  }
};


export const getApplicationBySummary = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findOne({ applicationId });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        applicationId: application.applicationId,
        studentName: application.studentDetails.studentName,
        mobileNo: application.contactDetails.mobileNo,
        gender: application.studentDetails.gender,
        status: application.status,
      },
    });
  } catch (error) {
    console.error('Error fetching application summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application summary',
      error: error.message,
    });
  }
};
