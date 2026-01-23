import express from 'express';

import {
  getFacultyProfile,
  getFacultyProfileByUserId,
  createFacultyProfile,
  updateFacultyProfile,
  getAllFacultyProfiles,
  deleteFacultyProfile,
} from '../controllers/facultyController.js';

const router = express.Router();

router.get('/all', getAllFacultyProfiles);

// Get faculty profile by user ID
router.get('/user/:userId', getFacultyProfileByUserId);

// Create faculty profile
router.post('/', createFacultyProfile);

// Get faculty profile by profile ID
router.get('/:id', getFacultyProfile);

// Update faculty profile
router.put('/:id', updateFacultyProfile);

// Delete faculty profile
router.delete('/:id', deleteFacultyProfile);

export default router;
