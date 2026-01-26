import express from 'express';
import { protect, admin, teacher, authorize } from '../middleware/auth.js';
import { createBatch, getAllBatches, getDepartmentById, getBatchById } from '../controllers/batchController.js';

const router = express.Router();

router.route('/')
  .post(protect, admin, createBatch)  // create a batch
  .get(getAllBatches);  // Allow public access to view batches

router.route('/all').get(getAllBatches);  // Allow public access

router.route('/department').get(getDepartmentById);  // Allow public access

router.route('/:batchId').get(getBatchById);  // Allow public access
export default router;
