import { Router } from 'express';
import * as driverController from '../controllers/driver.controller.js';
import { protect, restrictTo } from '../../auth/index.js';

const router = Router();

router.use(protect);

const allowedReaderRoles = ['FLEET_MANAGER', 'SAFETY_OFFICER', 'ADMIN'];
const allowedWriterRoles = ['FLEET_MANAGER', 'ADMIN'];
const allowedSafetyRoles = ['FLEET_MANAGER', 'SAFETY_OFFICER', 'ADMIN'];

// Expiring licenses must be declared before parametric routes
router.get('/expiring-license', restrictTo(...allowedReaderRoles), driverController.getExpiringLicenses);
router.get('/available', restrictTo(...allowedWriterRoles), driverController.getAvailableDrivers);

router.get('/', restrictTo(...allowedReaderRoles), driverController.getDrivers);
router.get('/:id', restrictTo(...allowedReaderRoles, 'DRIVER'), driverController.getDriverDetails);
router.get('/:id/trips', restrictTo(...allowedReaderRoles, 'DRIVER'), driverController.getDriverTrips);

// Write routes (Managers / Admins)
router.post('/', restrictTo(...allowedWriterRoles), driverController.registerDriver);
router.patch('/:id', restrictTo(...allowedWriterRoles), driverController.updateDriver);
router.delete('/:id', restrictTo(...allowedWriterRoles), driverController.deleteDriver);

// Status / Profile adjustments
router.patch('/:id/status', restrictTo(...allowedWriterRoles), driverController.updateStatus);
router.patch('/:id/license', restrictTo(...allowedSafetyRoles), driverController.updateLicense);

// Safety / Suspension updates (Safety Officer, Manager, Admin)
router.patch('/:id/safety-score', restrictTo(...allowedSafetyRoles), driverController.updateSafetyScore);
router.patch('/:id/suspend', restrictTo(...allowedSafetyRoles), driverController.suspendDriver);
router.patch('/:id/activate', restrictTo(...allowedSafetyRoles), driverController.activateDriver);

export default router;
