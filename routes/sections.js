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

// Allow public access to view sections (needed for applications)
router.get('/', getSections);
router.get('/batch/:batchId', getSectionsByBatch);
router.get('/:id', getSectionById);
router.put('/:id', protect, authorize('admin'), updateSection);
router.delete('/:id', protect, authorize('admin'), deleteSection);

export default router;
