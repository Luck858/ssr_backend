import express from 'express';
const router = express.Router();
import {
  adminRegisterDepartment,
  getAllDepartments,
  getDepartmentById,
  
} from '../controllers/departmentController.js';



import { protect, admin } from '../middleware/auth.js';
router.route('/register').post(protect, admin,adminRegisterDepartment);
router.route('/').get(getAllDepartments).post(protect, admin, adminRegisterDepartment); // Modified route
router.route('/:id').get(getDepartmentById);


export default router;