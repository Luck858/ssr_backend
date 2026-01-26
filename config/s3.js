import dotenv from 'dotenv';
dotenv.config();

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Validate S3 configuration
if (!process.env.AWS_S3_BUCKET) {
  console.warn('⚠️  AWS_S3_BUCKET is not set in environment variables');
}

// Debug
console.log('🪣 AWS S3 Configuration:', {
  REGION: process.env.AWS_REGION || 'us-east-1',
  BUCKET: process.env.AWS_S3_BUCKET || 'NOT SET',
  ACCESS_KEY: process.env.AWS_ACCESS_KEY_ID ? '✅ Configured' : '❌ MISSING',
  SECRET_KEY: process.env.AWS_SECRET_ACCESS_KEY ? '✅ Configured' : '❌ MISSING',
});

/**
 * Upload file to S3
 * @param {string} fileName - Name of the file in S3
 * @param {Buffer} fileBuffer - File content as buffer
 * @param {string} mimeType - MIME type of the file
 * @param {string} folderName - Folder in S3 bucket (e.g., 'applications', 'resumes')
 * @returns {Promise<{url: string, key: string, fileName: string}>}
 */
export const uploadToS3 = async (fileName, fileBuffer, mimeType, folderName = 'uploads') => {
  try {
    if (!process.env.AWS_S3_BUCKET) {
      throw new Error('AWS_S3_BUCKET is not configured');
    }

    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    const key = `${folderName}/${uniqueFileName}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      Metadata: {
        'upload-date': new Date().toISOString(),
      },
    };

    const command = new PutObjectCommand(params);
    const result = await s3Client.send(command);

    // Generate signed URL for private file (valid for 7 days)
    const signedUrl = await getSignedUrlForS3(key, 7 * 24 * 60 * 60);

    console.log(`✅ File uploaded to S3: ${key}`);

    return {
      url: signedUrl,
      key: key,
      fileName: uniqueFileName,
      size: fileBuffer.length,
      uploadedAt: new Date(),
    };
  } catch (error) {
    console.error('❌ S3 Upload Error:', error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

/**
 * Generate a signed URL for private files (valid for 1 hour)
 * @param {string} key - S3 object key
 * @param {number} expiresIn - Seconds until URL expires (default: 3600 = 1 hour)
 * @returns {Promise<string>} - Signed URL
 */
export const getSignedUrlForS3 = async (key, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    };

    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3Client, command, { expiresIn });

    return url;
  } catch (error) {
    console.error('❌ Error generating signed URL:', error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
};

/**
 * Delete file from S3
 * @param {string} key - S3 object key
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteFromS3 = async (key) => {
  try {
    if (!key) {
      throw new Error('S3 key is required');
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);

    console.log(`✅ File deleted from S3: ${key}`);

    return { success: true, message: 'File deleted from S3' };
  } catch (error) {
    console.error('❌ S3 Delete Error:', error);
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
};

/**
 * Delete multiple files from S3
 * @param {string[]} keys - Array of S3 object keys
 * @returns {Promise<{success: boolean, deleted: number}>}
 */
export const deleteMultipleFromS3 = async (keys) => {
  try {
    if (!Array.isArray(keys) || keys.length === 0) {
      throw new Error('Keys must be a non-empty array');
    }

    let deleted = 0;
    for (const key of keys) {
      try {
        await deleteFromS3(key);
        deleted++;
      } catch (error) {
        console.warn(`Failed to delete ${key}:`, error.message);
      }
    }

    return { success: true, deleted, total: keys.length };
  } catch (error) {
    console.error('❌ Batch delete error:', error);
    throw new Error(`Failed to delete files from S3: ${error.message}`);
  }
};

/**
 * Validate file before upload
 * @param {number} fileSize - File size in bytes
 * @param {string} mimeType - File MIME type
 * @param {number} maxSize - Maximum file size in MB (default: 10MB)
 * @returns {{valid: boolean, error: string | null}}
 */
export const validateFileUpload = (fileSize, mimeType, maxSize = 10) => {
  const maxBytes = maxSize * 1024 * 1024;
  
  // Allowed MIME types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (fileSize > maxBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize}MB limit`,
    };
  }

  if (!allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `File type ${mimeType} is not allowed`,
    };
  }

  return { valid: true, error: null };
};

export { s3Client };
