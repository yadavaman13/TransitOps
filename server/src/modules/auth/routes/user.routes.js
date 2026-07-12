import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { 
    updateProfileValidator, 
    adminUpdateRoleValidator,
    createUserValidator 
} from '../validators/user.validator.js';
import { changePasswordValidator } from '../validators/auth.validator.js';
import { uploadSingle } from '../../upload/middleware/upload.middleware.js';

const router = Router();

// Protect all routes
router.use(protect);

// Personal User Routes
router.get('/get-me', userController.getMe);
router.patch('/profile', updateProfileValidator, userController.updateProfile);
router.patch('/profile-image', uploadSingle, userController.updateProfileImage);
router.patch('/change-password', changePasswordValidator, userController.changePassword);
router.delete('/me', userController.deleteAccount);

// Admin / Fleet Manager Routes (Only accessible by users with role 'FLEET_MANAGER')
router.use(restrictTo('FLEET_MANAGER'));

router.post('/safety-officer', createUserValidator, userController.createSafetyOfficer);
router.post('/financial-analyst', createUserValidator, userController.createFinancialAnalyst);

router.get('/', userController.adminListUsers);
router.get('/:id', userController.adminGetUserById);
router.patch('/:id/role', adminUpdateRoleValidator, userController.adminUpdateRole);
router.delete('/:id', userController.adminDeleteUser);

export default router;