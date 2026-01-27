import express from 'express';
const router = express.Router();
import multer from 'multer';
import { uploadFile, uploadMultipleFiles, refreshSignedUrl, getFileUrl } from '../controllers/fileController.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('file'), uploadFile);
router.post('/upload-multiple', upload.array('files'), uploadMultipleFiles);
router.post('/refresh-signed-url', refreshSignedUrl);
router.get('/get-url', getFileUrl);  // NEW: Get fresh URL on-demand

export default router;