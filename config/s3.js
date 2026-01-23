import dotenv from 'dotenv';
dotenv.config();

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Debug
console.log('🪣 AWS S3 Configuration:', {
  REGION: process.env.AWS_REGION,
  BUCKET: process.env.AWS_S3_BUCKET,
  ACCESS_KEY: process.env.AWS_ACCESS_KEY_ID ? 'OK' : 'MISSING',
  SECRET_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'OK' : 'MISSING',
});

/**
 * Upload file to S3
 * @param {string} fileName - Name of the file in S3
 * @param {Buffer} fileBuffer - File content as buffer
 * @param {string} mimeType - MIME type of the file
 * @param {string} folderName - Folder in S3 bucket (e.g., 'applications', 'resumes')
 * @returns {Promise<{url: string, key: string}>}
 */
export const uploadToS3 = async (fileName, fileBuffer, mimeType, folderName = 'uploads') => {
  try {
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    const key = `${folderName}/${uniqueFileName}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      // Make files publicly readable
      ACL: 'public-read',
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Construct the S3 URL
    const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    return {
      url: s3Url,
      key: key,
      fileName: uniqueFileName,
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

/**
 * Delete file from S3
 * @param {string} key - S3 object key
 */
export const deleteFromS3 = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);

    return { success: true, message: 'File deleted from S3' };
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
};

export { s3Client };
