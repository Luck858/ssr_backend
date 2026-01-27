import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Application from '../models/Application.js';
import { getSignedUrlForS3 } from '../config/s3.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ssr';

/**
 * Extract S3 key from a signed URL
 * URL format: https://bucket-name.s3.region.amazonaws.com/PATH/TO/FILE?params...
 */
function extractS3KeyFromUrl(url) {
  try {
    const urlObj = new URL(url);
    let key = urlObj.pathname;
    
    // Remove leading slash
    if (key.startsWith('/')) {
      key = key.substring(1);
    }
    
    return key;
  } catch (error) {
    return null;
  }
}

/**
 * Regenerate all S3 signed URLs by extracting keys from old URLs
 * Run: node scripts/regenerateS3UrlsFromExisting.js
 */
async function regenerateUrls() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📊 Fetching all applications...');
    const applications = await Application.find({});
    console.log(`📈 Found ${applications.length} applications`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const app of applications) {
      try {
        let hasChanges = false;
        const updatedApp = { ...app.toObject() };

        // Regenerate uploadedFiles URLs
        if (updatedApp.uploadedFiles && typeof updatedApp.uploadedFiles === 'object') {
          for (const [fieldName, fileObj] of Object.entries(updatedApp.uploadedFiles)) {
            if (fileObj && fileObj.url) {
              console.log(`  🔄 Processing ${app.applicationId} - ${fieldName}`);
              try {
                // Extract S3 key from existing URL
                const s3Key = extractS3KeyFromUrl(fileObj.url);
                
                if (s3Key) {
                  // Generate new signed URL with current credentials
                  const newUrl = await getSignedUrlForS3(s3Key, 7 * 24 * 60 * 60); // 7 days
                  updatedApp.uploadedFiles[fieldName] = {
                    ...fileObj,
                    url: newUrl,
                    key: s3Key, // Store the key for future regeneration
                  };
                  hasChanges = true;
                  console.log(`    ✅ Regenerated URL`);
                } else {
                  console.warn(`    ⚠️  Could not extract S3 key from URL`);
                  errors++;
                }
              } catch (err) {
                console.warn(`    ⚠️  Failed to regenerate URL:`, err.message);
                errors++;
              }
            }
          }
        }

        // Regenerate signatureUpload URLs
        if (updatedApp.signatureUpload && typeof updatedApp.signatureUpload === 'object') {
          for (const [fieldName, fileObj] of Object.entries(updatedApp.signatureUpload)) {
            if (fileObj && fileObj.url) {
              console.log(`  🔄 Processing ${app.applicationId} - ${fieldName}`);
              try {
                // Extract S3 key from existing URL
                const s3Key = extractS3KeyFromUrl(fileObj.url);
                
                if (s3Key) {
                  // Generate new signed URL with current credentials
                  const newUrl = await getSignedUrlForS3(s3Key, 7 * 24 * 60 * 60); // 7 days
                  updatedApp.signatureUpload[fieldName] = {
                    ...fileObj,
                    url: newUrl,
                    key: s3Key, // Store the key for future regeneration
                  };
                  hasChanges = true;
                  console.log(`    ✅ Regenerated URL`);
                } else {
                  console.warn(`    ⚠️  Could not extract S3 key from URL`);
                  errors++;
                }
              } catch (err) {
                console.warn(`    ⚠️  Failed to regenerate URL:`, err.message);
                errors++;
              }
            }
          }
        }

        // Save if there were changes
        if (hasChanges) {
          await Application.updateOne(
            { _id: app._id },
            {
              uploadedFiles: updatedApp.uploadedFiles,
              signatureUpload: updatedApp.signatureUpload,
            }
          );
          console.log(`  ✅ Updated ${app.applicationId}\n`);
          updated++;
        } else {
          console.log(`  ⏭️  No files found for ${app.applicationId}, skipping\n`);
          skipped++;
        }
      } catch (appError) {
        console.error(`  ❌ Error processing ${app.applicationId}:`, appError.message);
        errors++;
      }
    }

    console.log('\n========== SUMMARY ==========');
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total: ${applications.length}`);

    await mongoose.disconnect();
    console.log('\n🎉 Done! All URLs regenerated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
  }
}

regenerateUrls();
