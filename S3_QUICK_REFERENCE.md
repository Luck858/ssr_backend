# S3 Integration Quick Reference

## Current Setup ✅

Your application is **fully configured** for AWS S3 uploads. Files are directly uploaded to S3, not stored locally.

## How It Works

### 1. Frontend Upload (React)
```javascript
// CombinedApplicantDetails.jsx
const handleUploadedFile = async (e) => {
  const file = e.target.files[0];
  const res = await uploadSingleFile(file);
  const url = res.file.url; // S3 URL - store this
  setUploadedFiles(prev => ({ ...prev, [name]: url }));
};
```

### 2. API Call to Backend
```javascript
// admissonService.jsx
export const uploadSingleFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/api/files/upload", formData);
  return response.data;
};
```

### 3. Backend Processing
```javascript
// fileController.js
export const uploadFile = async (req, res) => {
  // Validate file
  const validation = validateFileUpload(req.file.size, req.file.mimetype);
  
  // Upload to S3
  const result = await uploadToS3(
    req.file.originalname,
    req.file.buffer,
    req.file.mimetype,
    'applications'
  );
  
  // Return S3 URL
  res.json({ success: true, file: { url: result.url, s3Key: result.key } });
};
```

### 4. S3 Storage
```
AWS S3 Bucket: your-bucket-name
└── applications/
    ├── 1704067200000-resume.pdf
    ├── 1704067201000-photo.jpg
    └── 1704067202000-aadhar.png
```

## Environment Setup

### .env (Required)
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your-bucket-name
```

### Verify Configuration
1. Check `.env` file exists in `ssr_backend/`
2. Verify all 4 variables are set
3. Restart backend: `npm run dev`

## Common Tasks

### Upload a File
```javascript
const file = document.getElementById('fileInput').files[0];
const response = await uploadSingleFile(file);
console.log('S3 URL:', response.file.url);
```

### Delete a File
```javascript
await deleteFile({ s3Key: 'applications/1704067200000-resume.pdf' });
```

### Get File for Display
```javascript
// Just use the URL directly
<img src={fileUrl} />
<a href={fileUrl}>Download</a>
```

### Generate Signed URL (Private Files)
```javascript
const signedUrl = await getSignedUrlForS3(s3Key, 3600); // 1 hour
```

## File Limits & Validation

- **Max File Size**: 10 MB
- **Allowed Types**: 
  - Images: JPEG, PNG, GIF, WebP
  - Documents: PDF, DOC, DOCX, XLS, XLSX

## Routes

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/files/upload` | Upload single file |
| POST | `/api/files/upload-multiple` | Upload multiple files |
| DELETE | `/api/files/delete` | Delete single file |
| DELETE | `/api/files/delete-multiple` | Delete multiple files |

## Storage Locations

- **Admission Forms**: `applications/`
- **Resumes**: `resumes/`
- **Gallery**: `gallery/`
- **Hero Images**: `hero/`
- **Other**: `uploads/`

## Monitoring & Costs

### Check Usage
1. AWS S3 Console → Select bucket
2. Go to "Metrics" tab
3. View storage size and request count

### Estimate Monthly Cost
- **1 GB storage**: ~$0.023
- **1,000 uploads**: ~$0.005
- **10,000 downloads**: ~$0.004
- **Total for small app**: $5-20/month

## Troubleshooting

### Upload Fails
```
Error: Access Denied
→ Check AWS credentials in .env
→ Verify IAM user has S3FullAccess
```

### File Not Found
```
Error: NoSuchBucket
→ Verify bucket name is correct
→ Check bucket exists in AWS console
```

### CORS Error
```
Error: CORS policy
→ Add frontend URL to S3 bucket CORS settings
→ Settings → Permissions → CORS
```

## Next Steps

1. **Update `.env`** with AWS credentials
2. **Test upload** in admission form
3. **Verify files** appear in S3 console
4. **Monitor costs** monthly

---

**Files are now stored in AWS S3!** ✅
