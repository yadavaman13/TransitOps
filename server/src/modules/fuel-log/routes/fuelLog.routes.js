import { Router } from 'express';
import * as fuelLogController from '../controllers/fuelLog.controller.js';
import { protect, restrictTo } from '../../auth/index.js';

const router = Router();
router.use(protect);

const staffRoles = ['ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];
const writeRoles = ['ADMIN', 'FLEET_MANAGER'];

// Summary and specific vehicle query routes (must be registered before /:id)
router.get('/summary', restrictTo('ADMIN', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'), fuelLogController.getFuelSummary);
router.get('/vehicle/:vehicleId', restrictTo(...staffRoles), fuelLogController.getVehicleFuelLogs);

// Standard CRUD routes
router.post('/', restrictTo('ADMIN', 'FLEET_MANAGER', 'DRIVER'), fuelLogController.createFuelLog);
router.get('/', restrictTo(...staffRoles, 'DRIVER'), fuelLogController.getFuelLogs);
router.get('/:id', restrictTo(...staffRoles, 'DRIVER'), fuelLogController.getFuelLogDetails);
router.patch('/:id', restrictTo(...writeRoles), fuelLogController.updateFuelLog);
router.delete('/:id', restrictTo(...writeRoles), fuelLogController.deleteFuelLog);

export default router;
