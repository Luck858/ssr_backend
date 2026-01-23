import express from 'express';
import multer from 'multer';
import {
  getStudentProfile,
  getStudentProfileByUserId,
  createStudentProfile,
  updateStudentProfile,
  uploadProfileImage,
  deleteProfileImage,
  getAllStudentProfiles,
  deleteStudentProfile,
} from '../controllers/studentController.js';

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'));
    }
  },
});

// Routes
router.get('/all', getAllStudentProfiles);
router.get('/:id', getStudentProfile);
router.get('/user/:userId', getStudentProfileByUserId);
router.post('/', createStudentProfile);
router.put('/:id', updateStudentProfile);
router.post('/upload/image', upload.single('file'), uploadProfileImage);
router.delete('/:id/image', deleteProfileImage);
router.delete('/:id', deleteStudentProfile);

export default router;
