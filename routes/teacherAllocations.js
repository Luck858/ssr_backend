import express from 'express';
import {
  createAllocation,
  getAllAllocations,
  getAllocationsByTeacher,
  getAllocationById,
  updateAllocation,
  deleteAllocation
} from '../controllers/teacherAllocationController.js';
import { protect, admin,authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, admin, createAllocation);
router.get('/', protect, getAllAllocations);
router.get('/teacher/:teacherId', protect, getAllocationsByTeacher);
router.get('/:id', protect, getAllocationById);
router.put('/:id', protect, authorize('admin'), updateAllocation);
router.delete('/:id', protect, authorize('admin'), deleteAllocation);

export default router;
