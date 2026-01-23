import express from 'express';
const router = express.Router();
import { createApplication,getAllApplications,getApplicationById,getApplicationBySummary,updateOfficeUseOnly }  from '../controllers/applicationController.js';
import { protect,teacher,admin,authorize} from '../middleware/auth.js';

router.post('/',protect,authorize('teacher','admin'), createApplication);
router.get('/',protect,authorize('teacher','admin'), getAllApplications);
router.get('/:id',protect,authorize('teacher','admin'), getApplicationById);

router.get('/summary/:applicationId', protect,authorize('teacher','admin'),getApplicationBySummary);
router.post('/office-use/:applicationId', protect,authorize('teacher','admin'),updateOfficeUseOnly);

export default router;