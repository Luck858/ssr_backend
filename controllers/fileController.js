import Application from '../models/Application.js';
import { uploadToS3, deleteFromS3, deleteMultipleFromS3, validateFileUpload, getSignedUrlForS3 } from '../config/s3.js';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Validate file
    const validation = validateFileUpload(
      req.file.size,
      req.file.mimetype,
      10 // 10MB max
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    // Upload to S3
    const folder = req.body.folder || 'applications';
    const result = await uploadToS3(
      req.file.originalname,
      req.file.buffer,
      req.file.mimetype,
      folder
    );

    const fileObject = {
      filename: result.fileName,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: result.url,
      s3Key: result.key,
      uploadedAt: result.uploadedAt,
    };

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully to S3',
      file: fileObject,
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing file',
      error: error.message,
    });
  }
};

export const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const folder = req.body.folder || 'uploads';
    const uploadedFiles = [];
    const errors = [];

    for (const file of req.files) {
      try {
        // Validate each file
        const validation = validateFileUpload(
          file.size,
          file.mimetype,
          10
        );

        if (!validation.valid) {
          errors.push({
            filename: file.originalname,
            error: validation.error,
          });
          continue;
        }

        const result = await uploadToS3(
          file.originalname,
          file.buffer,
          file.mimetype,
          folder
        );

        uploadedFiles.push({
          filename: result.fileName,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: result.url,
          s3Key: result.key,
          uploadedAt: result.uploadedAt,
        });
      } catch (fileError) {
        errors.push({
          filename: file.originalname,
          error: fileError.message,
        });
      }
    }

    return res.status(uploadedFiles.length > 0 ? 200 : 400).json({
      success: uploadedFiles.length > 0,
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error processing multiple files:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing files',
      error: error.message,
    });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { s3Key } = req.body;

    if (!s3Key) {
      return res.status(400).json({
        success: false,
        message: 'S3 key is required',
      });
    }

    await deleteFromS3(s3Key);

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message,
    });
  }
};

export const deleteMultipleFiles = async (req, res) => {
  try {
    const { s3Keys } = req.body;

    if (!Array.isArray(s3Keys) || s3Keys.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'S3 keys array is required',
      });
    }

    const result = await deleteMultipleFromS3(s3Keys);

    return res.status(200).json({
      success: true,
      message: `${result.deleted} files deleted successfully`,
      deleted: result.deleted,
      total: result.total,
    });
  } catch (error) {
    console.error('Error deleting multiple files:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting files',
      error: error.message,
    });
  }
};
/**
 * Refresh/regenerate signed URL for S3 files (used when URLs expire)
 * @param {string} s3Key - S3 object key
 * @param {number} expiresIn - Expiration time in seconds (default: 7 days)
 */
export const refreshSignedUrl = async (req, res) => {
  try {
    const { s3Key, expiresIn } = req.body;

    if (!s3Key) {
      return res.status(400).json({
        success: false,
        message: 'S3 key is required',
      });
    }

    const signedUrl = await getSignedUrlForS3(s3Key, expiresIn || 7 * 24 * 60 * 60);

    return res.status(200).json({
      success: true,
      message: 'Signed URL refreshed successfully',
      url: signedUrl,
    });
  } catch (error) {
    console.error('Error refreshing signed URL:', error);
    return res.status(500).json({
      success: false,
      message: 'Error refreshing signed URL',
      error: error.message,
    });
  }
};