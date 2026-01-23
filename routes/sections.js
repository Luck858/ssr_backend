import express from 'express';
import {
  createSection,
  createMultipleSections,
  getSections,
  getSectionsByBatch,
  getSectionById,
  updateSection,
  deleteSection
} from '../controllers/sectionController.js';
import { protect, authorize,admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, admin, createMultipleSections);

router.get('/', protect, getSections);
router.get('/batch/:batchId', protect, getSectionsByBatch);
router.get('/:id', protect, getSectionById);
router.put('/:id', protect, authorize('admin'), updateSection);
router.delete('/:id', protect, authorize('admin'), deleteSection);

export default router;
