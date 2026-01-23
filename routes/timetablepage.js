import express from 'express';
import {
  createTimetable,
  getAllTimetables,
  getTimetableByBatchSection,
  getTimetableByTeacher,
  getTimetableById,
  updateTimetable,
  deleteTimetable
} from '../controllers/timetableController.js';
import { protect, authorize,admin ,teacher} from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, admin, createTimetable);
router.get('/', protect,authorize('admin','teacher'), getAllTimetables);
router.get('/batch/:batchId/section/:section', protect, getTimetableByBatchSection);
router.get('/teacher/:teacherId', protect, getTimetableByTeacher);
router.get('/:id', protect, getTimetableById);
router.put('/:id', protect, authorize('admin'), updateTimetable);
router.delete('/:id', protect, authorize('admin'), deleteTimetable);

export default router;
