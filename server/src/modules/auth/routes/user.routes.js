import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { updateProfileValidator, adminUpdateRoleValidator } from '../validators/user.validator.js';
import { changePasswordValidator } from '../validators/auth.validator.js';

const router = Router();

// Protect all routes
router.use(protect);

// Personal User Routes
router.get('/get-me', userController.getMe);
router.patch('/profile', updateProfileValidator, userController.updateProfile);
router.patch('/change-password', changePasswordValidator, userController.changePassword);
router.delete('/me', userController.deleteAccount);

// Admin Routes (Only accessible by users with role 'ADMIN')
router.use(restrictTo('ADMIN'));

router.get('/', userController.adminListUsers);
router.get('/:id', userController.adminGetUserById);
router.patch('/:id/role', adminUpdateRoleValidator, userController.adminUpdateRole);
router.delete('/:id', userController.adminDeleteUser);

export default router;