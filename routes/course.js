import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { createCourse, getAllCourses, getCourseById } from '../controllers/courseController.js';

const router = express.Router();

router.route('/').post(protect, authorize('admin'), createCourse).get(getAllCourses);  // Allow public access to view courses
router.route('/:id').get(getCourseById);  // Allow public access

export default router;
