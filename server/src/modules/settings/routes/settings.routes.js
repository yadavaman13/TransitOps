import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { protect, restrictTo } from '../../auth/middleware/auth.middleware.js';
import { themeValidator, notificationPrefsValidator, fleetRulesValidator } from '../validators/settings.validator.js';

const router = Router();

// All routes require authentication
router.use(protect);

// Settings routes
router.get('/', settingsController.get);
router.patch('/', settingsController.update);
router.patch('/notifications', notificationPrefsValidator, settingsController.updateNotifications);
router.patch('/fleet-rules', restrictTo('FLEET_MANAGER', 'ADMIN'), fleetRulesValidator, settingsController.updateFleetRules);
router.patch('/theme', themeValidator, settingsController.updateTheme);

export default router;
