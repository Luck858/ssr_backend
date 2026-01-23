import express from 'express';
import {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject
} from '../controllers/subjectController.js';
import { protect, authorize,admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('admin'), createSubject);
router.get('/', protect, getAllSubjects);
router.get('/:id', protect, getSubjectById);
router.put('/:id', protect, authorize('admin'), updateSubject);
router.delete('/:id', protect, authorize('admin'), deleteSubject);

export default router;
