import Draft from '../models/Draft.js';

// Create a new draft (always creates new, for multiple drafts per user)
export const saveDraft = async (req, res) => {
  try {
    const { draftData, status = 'draft' } = req.body;
    const userId = req.user._id; // from auth middleware

    // Calculate progress based on completed fields
    const progress = calculateProgress(draftData);

    // Extract student details for quick reference
    const studentDetails = {
      studentName: draftData?.studentDetails?.studentName,
      fatherName: draftData?.studentDetails?.fatherName,
      motherName: draftData?.studentDetails?.motherName,
      dateOfBirth: draftData?.studentDetails?.dateOfBirth,
      gender: draftData?.studentDetails?.gender,
      email: draftData?.contactDetails?.email,
      mobileNo: draftData?.contactDetails?.mobileNo,
    };

    // Always create a new draft (supports multiple drafts per user)
    const draft = new Draft({
      userId,
      draftData,
      status,
      progress,
      studentDetails,
      savedAt: new Date(),
    });

    await draft.save();
    res.status(201).json({
      success: true,
      message: 'Draft saved successfully',
      data: draft,
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving draft',
      error: error.message,
    });
  }
};

// Get all drafts for current user
export const getUserDrafts = async (req, res) => {
  try {
    const userId = req.user._id;

    const drafts = await Draft.find({ userId, status: 'draft' })
      .sort({ lastModified: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: drafts,
    });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching drafts',
      error: error.message,
    });
  }
};

// Get draft by ID
export const getDraftById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const draft = await Draft.findOne({
      _id: id,
      userId,
    });

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found',
      });
    }

    res.status(200).json({
      success: true,
      data: draft,
    });
  } catch (error) {
    console.error('Error fetching draft:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching draft',
      error: error.message,
    });
  }
};

// Update draft
export const updateDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { draftData, status } = req.body;
    const userId = req.user._id;

    const progress = calculateProgress(draftData);

    const studentDetails = {
      studentName: draftData?.studentDetails?.studentName,
      fatherName: draftData?.studentDetails?.fatherName,
      motherName: draftData?.studentDetails?.motherName,
      dateOfBirth: draftData?.studentDetails?.dateOfBirth,
      gender: draftData?.studentDetails?.gender,
      email: draftData?.contactDetails?.email,
      mobileNo: draftData?.contactDetails?.mobileNo,
    };

    const draft = await Draft.findOneAndUpdate(
      {
        _id: id,
        userId,
      },
      {
        draftData,
        status: status || 'draft',
        progress,
        studentDetails,
        lastModified: new Date(),
      },
      { new: true }
    );

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Draft updated successfully',
      data: draft,
    });
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating draft',
      error: error.message,
    });
  }
};

// Delete draft
export const deleteDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const draft = await Draft.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Draft deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting draft',
      error: error.message,
    });
  }
};

// Helper function to calculate progress
const calculateProgress = (draftData) => {
  if (!draftData) return 0;

  const requiredFields = [
    'studentDetails.studentName',
    'studentDetails.fatherName',
    'studentDetails.motherName',
    'studentDetails.dateOfBirth',
    'studentDetails.gender',
    'addressDetails.village',
    'addressDetails.mandal',
    'addressDetails.district',
    'addressDetails.pinCode',
    'contactDetails.mobileNo',
    'contactDetails.email',
  ];

  let filledFields = 0;
  
  requiredFields.forEach((path) => {
    const value = getNestedValue(draftData, path);
    if (value && value !== '') {
      filledFields++;
    }
  });

  return Math.round((filledFields / requiredFields.length) * 100);
};

// Helper to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
};
