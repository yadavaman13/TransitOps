import { Router } from 'express';
import * as maintenanceController from '../controllers/maintenance.controller.js';
import { protect, restrictTo } from '../../auth/index.js';

const router = Router();
router.use(protect);

const allowedReaderRoles = ['ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];
const allowedWriterRoles = ['ADMIN', 'FLEET_MANAGER'];

// Get active and vehicle history routes (registered before /:id)
router.get('/active', restrictTo(...allowedReaderRoles), maintenanceController.getActiveMaintenanceRecords);
router.get('/vehicle/:vehicleId', restrictTo(...allowedReaderRoles), maintenanceController.getVehicleMaintenanceHistory);

// CRUD routes
router.post('/', restrictTo(...allowedWriterRoles), maintenanceController.createMaintenance);
router.get('/', restrictTo(...allowedReaderRoles), maintenanceController.getMaintenanceRecords);
router.get('/:id', restrictTo(...allowedReaderRoles), maintenanceController.getMaintenanceDetails);
router.patch('/:id', restrictTo(...allowedWriterRoles), maintenanceController.updateMaintenance);
router.post('/:id/close', restrictTo(...allowedWriterRoles), maintenanceController.closeMaintenance);
router.post('/:id/cancel', restrictTo(...allowedWriterRoles), maintenanceController.cancelMaintenance);

export default router;
