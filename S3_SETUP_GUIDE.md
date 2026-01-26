# AWS S3 Integration Guide

## Overview
Your application is configured to upload files directly to AWS S3 instead of storing them locally. This provides better scalability, security, and performance.

## Prerequisites

1. **AWS Account** - Create one at https://aws.amazon.com
2. **Node.js Dependencies** - Already installed: `@aws-sdk/client-s3`, `multer`

## Step-by-Step Setup

### Step 1: Create an S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/s3/home)
2. Click **Create bucket**
3. Enter bucket name: `your-app-bucket` (must be globally unique)
4. Select region: `us-east-1` (or your preferred region)
5. **Block Public Access settings:**
   - ✅ Uncheck "Block all public access" (if you want public read access)
   - Or leave checked if you want private access with signed URLs
6. Click **Create bucket**

### Step 2: Create IAM User with S3 Permissions

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Create user**
3. Enter username: `s3-app-user`
4. Click **Next**
5. Click **Attach policies directly**
6. Search for and select: `AmazonS3FullAccess`
7. Click **Create user**

### Step 3: Generate Access Keys

1. Click on the created user
2. Go to **Security credentials** tab
3. Scroll to **Access keys** section
4. Click **Create access key**
5. Select **Application running outside AWS**
6. Click **Create access key**
7. **Copy and save:**
   - Access Key ID
   - Secret Access Key

### Step 4: Configure Environment Variables

Create `.env` file in `ssr_backend/` with your credentials:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
AWS_S3_BUCKET=your-app-bucket
```

⚠️ **Never commit `.env` to version control!** Add to `.gitignore`

### Step 5: Configure CORS (if needed)

If frontend and backend are on different domains:

1. Go to S3 bucket settings
2. Click **Permissions** tab
3. Scroll to **CORS** section
4. Click **Edit**
5. Add:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:5173", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

6. Click **Save**

## File Upload Flow

### Frontend: `CombinedApplicantDetails.jsx`
```javascript
const handleUploadedFile = async (e) => {
  const { name, files } = e.target;
  if (!files || !files[0]) return;
  
  try {
    // Calls backend API to upload to S3
    const res = await uploadSingleFile(files[0]);
    const url = res.file?.url || '';
    if (url) {
      setUploadedFiles(prev => ({ ...prev, [name]: url }));
    }
  } catch (err) {
    console.error('Upload failed', err);
  }
};
```

### Backend: `fileController.js`
```javascript
export const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  // Upload to S3
  const folder = req.body.folder || 'applications';
  const result = await uploadToS3(
    req.file.originalname,
    req.file.buffer,
    req.file.mimetype,
    folder
  );

  // Return S3 URL to frontend
  return res.status(200).json({
    success: true,
    file: {
      filename: result.fileName,
      url: result.url,
      s3Key: result.key,
      uploadedAt: new Date(),
    },
  });
};
```

### Backend: `config/s3.js`
```javascript
export const uploadToS3 = async (fileName, fileBuffer, mimeType, folderName) => {
  const timestamp = Date.now();
  const uniqueFileName = `${timestamp}-${fileName}`;
  const key = `${folderName}/${uniqueFileName}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: 'public-read', // Makes file publicly readable
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { url: s3Url, key, fileName: uniqueFileName };
};
```

## File Folder Structure in S3

Files are organized by folder:

```
your-bucket/
├── applications/
│   ├── 1704067200000-resume.pdf
│   ├── 1704067201000-aadhar.jpg
│   └── ...
├── resumes/
│   └── ...
├── hero/
│   └── ...
└── uploads/
    └── ...
```

## Testing Upload

1. Start your backend:
```bash
cd ssr_backend
npm install
npm run dev
```

2. Go to admission form in frontend
3. Upload a file
4. Check browser console for the S3 URL
5. Verify file appears in [S3 Console](https://s3.console.aws.amazon.com/s3/home)

## Troubleshooting

### Error: "Access Denied"
- ✅ Verify AWS credentials in `.env`
- ✅ Check IAM user has `AmazonS3FullAccess`
- ✅ Verify bucket name is correct

### Error: "The bucket does not exist"
- ✅ Ensure S3 bucket is created
- ✅ Check bucket name in `.env` matches exactly
- ✅ Verify you're in the correct AWS region

### File not uploading
- ✅ Check network tab in browser dev tools
- ✅ Ensure multer middleware is configured
- ✅ Verify file size doesn't exceed limits

### CORS errors
- ✅ Configure CORS in S3 bucket settings
- ✅ Ensure frontend URL is in CORS origins

## Cost Estimates (AWS Pricing)

- **Storage**: ~$0.023 per GB/month
- **PUT requests**: $0.005 per 1,000 requests
- **GET requests**: $0.0004 per 1,000 requests
- **Data transfer**: First 1GB free, then $0.09/GB

For a small school: **~$5-15/month**

## Best Practices

1. **Set bucket versioning** - Recover accidentally deleted files
2. **Enable encryption** - Use S3-managed encryption (SSE-S3)
3. **Set lifecycle policies** - Delete old uploads after 90 days
4. **Use signed URLs** - For private files instead of ACL
5. **Monitor costs** - Use S3 Storage Lens
6. **Backup important files** - Enable cross-region replication

## Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [S3 Pricing](https://aws.amazon.com/s3/pricing/)

---

**Your current setup is production-ready!** Files are automatically uploaded to S3 when users submit the admission form.
