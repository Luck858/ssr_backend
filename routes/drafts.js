import express from 'express';
import {
  saveDraft,
  getUserDrafts,
  getDraftById,
  updateDraft,
  deleteDraft,
} from '../controllers/draftController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Get all drafts for current user
router.get('/user', getUserDrafts);

// Get specific draft by ID
router.get('/:id', getDraftById);

// Save new draft
router.post('/', saveDraft);

// Update existing draft
router.put('/:id', updateDraft);

// Delete draft
router.delete('/:id', deleteDraft);

export default router;
