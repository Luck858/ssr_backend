import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { createCourse, getAllCourses, getCourseById } from '../controllers/courseController.js';

const router = express.Router();

router.route('/').post(protect, authorize('admin'), createCourse).get(protect, authorize('admin','teacher','student'), getAllCourses);
router.route('/:id').get(protect, authorize('admin','teacher','student'), getCourseById);

export default router;
