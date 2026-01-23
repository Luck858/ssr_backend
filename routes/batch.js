import express from 'express';
import { protect, admin, teacher, authorize } from '../middleware/auth.js';
import { createBatch, getAllBatches, getDepartmentById, getBatchById } from '../controllers/batchController.js';

const router = express.Router();

router.route('/')
  .post(protect, admin, createBatch)  // create a batch
  .get(protect, authorize('admin', 'teacher'), getAllBatches);


router.route('/all').get(protect, authorize('admin', 'teacher'), getAllBatches);

router.route('/department').get(protect, authorize('admin', 'teacher'), getDepartmentById);

router.route('/:batchId').get(protect, authorize('admin', 'teacher'), getBatchById);
export default router;
