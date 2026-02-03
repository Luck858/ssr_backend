import express from 'express';
import multer from 'multer';
import {
  adminRegisterUser,
  teacherRegisterStudent,
  toggleTeacherPermission,
  getAllUsers,
  getMyStudents,
} from '../controllers/registrationController.js';
import { protect, authorize, checkStudentRegistrationPermission } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'photo') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Photo must be an image file'));
      }
    } else {
      cb(null, true);
    }
  }
});

router.post('/admin/register-user', protect, authorize('admin'), upload.single('photo'), adminRegisterUser);

router.post(
  '/teacher/register-student',
  protect,
  authorize('teacher'),
  checkStudentRegistrationPermission,
  teacherRegisterStudent
);

router.patch('/admin/toggle-permission/:userId', protect, authorize('admin'), toggleTeacherPermission);

router.get('/admin/users', protect, authorize('admin'), getAllUsers);

router.get('/teacher/my-students', protect, authorize('teacher'), getMyStudents);

export default router;
