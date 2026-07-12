import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { protect, restrictTo } from '../../auth/middleware/auth.middleware.js';
import { notificationIdValidator } from '../validators/notification.validator.js';

const router = Router();

// All routes require authentication
router.use(protect);

// User notification routes
router.get('/', notificationController.list);
router.patch('/read-all', notificationController.readAll);
router.get('/:id', notificationIdValidator, notificationController.details);
router.patch('/:id/read', notificationIdValidator, notificationController.markRead);
router.delete('/:id', notificationIdValidator, notificationController.deleteNotification);

// Fleet Manager / Admin only — reminder triggers
router.post('/license-reminder', restrictTo('FLEET_MANAGER', 'ADMIN'), notificationController.licenseReminder);
router.post('/maintenance-reminder', restrictTo('FLEET_MANAGER', 'ADMIN'), notificationController.maintenanceReminder);

export default router;
