// routes/feeRoutes.js
import express from 'express';
const router = express.Router();
import {createFee,getAllFees,deleteFee,getStudentFees,updateStudentFee,applyDiscount} from '../controllers/feeController.js';
import {protect,admin} from '../middleware/auth.js';

// Routes
router.route('/').post(protect,admin,createFee);
router.route('/all').get(protect,admin,getAllFees);

router.route('/:id').delete(protect,admin,deleteFee);
router.route('/students').get(protect,admin,getStudentFees);
router.route('/student/:id').put(protect,admin,updateStudentFee);
router.route('/student/:id/discount').patch(protect,admin,applyDiscount);

export default router;
