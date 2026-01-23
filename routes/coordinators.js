import express from 'express';
import {
  getAllTeachers,
  getAllCoordinators,
  promoteTeacherToCoordinator,
  demoteCoordinatorToTeacher,
  getTeachersAndCoordinators,
  getDepartments
} from '../controllers/coordinatorController.js';
import { protect,admin ,authorize} from '../middleware/auth.js';

const router = express.Router();

router.get('/teachers', protect, authorize('admin'), getAllTeachers);
router.get('/coordinators', protect, authorize('admin'), getAllCoordinators);
router.get('/all', protect, admin, getTeachersAndCoordinators);
router.put('/:teacherId/promote', protect, admin, promoteTeacherToCoordinator);
router.put('/:coordinatorId/demote', protect, admin, demoteCoordinatorToTeacher);

export default router;
