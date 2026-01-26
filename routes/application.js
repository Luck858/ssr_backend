import express from 'express';
const router = express.Router();
import { createApplication,getAllApplications,getApplicationById,getApplicationBySummary,updateOfficeUseOnly }  from '../controllers/applicationController.js';
import { protect,teacher,admin,authorize} from '../middleware/auth.js';

router.post('/',protect,authorize('teacher','admin'), createApplication);
router.get('/',protect,authorize('teacher','admin'), getAllApplications);
// Allow public access to view application details and summary
router.get('/:id', getApplicationById);
router.get('/summary/:applicationId', getApplicationBySummary);
// Require authentication for office use updates
router.post('/office-use/:applicationId', protect,authorize('teacher','admin'),updateOfficeUseOnly);

export default router;