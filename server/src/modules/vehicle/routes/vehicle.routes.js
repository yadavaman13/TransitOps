import { Router } from 'express';
import * as vehicleController from '../controllers/vehicle.controller.js';
import { protect, restrictTo } from '../../auth/index.js';

const router = Router();

router.use(protect);

// Read-only routes accessible by all staff roles (Managers, Safety Officers, Analysts, Admins)
const allowedReaderRoles = ['Fleet Manager', 'Safety Officer', 'Financial Analyst', 'ADMIN'];
const allowedWriterRoles = ['Fleet Manager', 'ADMIN'];

router.get('/', restrictTo(...allowedReaderRoles), vehicleController.getVehicles);
router.get('/available', restrictTo(...allowedWriterRoles), vehicleController.getAvailableVehicles);
router.get('/:id', restrictTo(...allowedReaderRoles), vehicleController.getVehicleDetails);
router.get('/:id/trips', restrictTo(...allowedReaderRoles), vehicleController.getVehicleTrips);
router.get('/:id/maintenance', restrictTo(...allowedReaderRoles), vehicleController.getVehicleMaintenance);
router.get('/:id/fuel-logs', restrictTo(...allowedReaderRoles), vehicleController.getVehicleFuelLogs);
router.get('/:id/expenses', restrictTo(...allowedReaderRoles), vehicleController.getVehicleExpenses);

// Write routes (Fleet Manager & Admin)
router.post('/', restrictTo(...allowedWriterRoles), vehicleController.registerVehicle);
router.patch('/:id', restrictTo(...allowedWriterRoles), vehicleController.updateVehicle);
router.delete('/:id', restrictTo(...allowedWriterRoles), vehicleController.deleteVehicle);
router.patch('/:id/status', restrictTo(...allowedWriterRoles), vehicleController.updateStatus);
router.patch('/:id/retire', restrictTo(...allowedWriterRoles), vehicleController.retireVehicle);
router.patch('/:id/restore', restrictTo(...allowedWriterRoles), vehicleController.restoreVehicle);
router.patch('/:id/odometer', restrictTo(...allowedWriterRoles), vehicleController.updateOdometer);

export default router;
