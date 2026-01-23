import Application from '../models/Application.js';
import { uploadToS3, deleteFromS3 } from '../config/s3.js';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
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
      uploadedAt: new Date(),
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

    const folder = req.body.folder || 'applications';

    // Upload all files to S3 in parallel
    const uploadPromises = req.files.map((file) =>
      uploadToS3(file.originalname, file.buffer, file.mimetype, folder)
    );

    const uploadResults = await Promise.all(uploadPromises);

    const filesSaved = req.files.map((file, index) => ({
      filename: uploadResults[index].fileName,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: uploadResults[index].url,
      s3Key: uploadResults[index].key,
      uploadedAt: new Date(),
    }));

    return res.status(200).json({
      success: true,
      message: 'Files uploaded successfully to S3',
      files: filesSaved,
    });
  } catch (error) {
    console.error('Error processing files:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing files',
      error: error.message,
    });
  }
};
