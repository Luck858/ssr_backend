import express from 'express';
import { getProfile, updateProfile, getUsers, getUserById, getUsersWithPhotos, getPublicFaculty } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route - no authentication required
router.get('/public/faculty', getPublicFaculty);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
// List users (supports query params: role, batch, section, department, search, limit, page)
router.get('/', protect, getUsers);
router.get('/photos', protect, getUsersWithPhotos);
router.get('/:id', protect, getUserById);

export default router;
