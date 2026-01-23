import express from 'express';
import {
  createAttendance,
  getAllAttendance,
  getStudentAttendance,
  getBatchAttendanceReport,
  getAttendanceById,
  updateAttendance
} from '../controllers/attendanceController.js';
import { protect, admin ,teacher,authorize} from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect,authorize('admin','teacher'),createAttendance);
router.get('/', protect, getAllAttendance);
router.get('/student/:studentId', protect, getStudentAttendance);
router.get('/report/batch/:batchId/section/:section', protect, authorize('admin','teacher'), getBatchAttendanceReport);
router.get('/:id', protect, getAttendanceById);
router.put('/:id', protect,  authorize('admin','teacher'), updateAttendance);

export default router;
