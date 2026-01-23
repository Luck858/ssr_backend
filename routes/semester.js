import express from 'express';
import {
  createSemester,
  getAllSemesters,
  getCurrentSemester,
  getSemesterById,
  updateSemester,
  setCurrentSemester,
  deleteSemester
} from '../controllers/semesterController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('admin'), createSemester);
router.get('/', protect, getAllSemesters);
router.get('/current/:department', protect, getCurrentSemester);
router.get('/:id', protect, getSemesterById);
router.put('/:id', protect, authorize('admin'), updateSemester);
router.put('/:id/set-current', protect, authorize('admin'), setCurrentSemester);
router.delete('/:id', protect, authorize('admin'), deleteSemester);

export default router;
