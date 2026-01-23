import express from 'express';
import {
  adminRegisterUser,
  teacherRegisterStudent,
  toggleTeacherPermission,
  getAllUsers,
  getMyStudents,
} from '../controllers/registrationController.js';
import { protect, authorize, checkStudentRegistrationPermission } from '../middleware/auth.js';

const router = express.Router();

router.post('/admin/register-user', protect, authorize('admin'), adminRegisterUser);

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
