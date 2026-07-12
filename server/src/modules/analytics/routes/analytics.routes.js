import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { protect, restrictTo } from '../../auth/index.js';

const router = Router();
router.use(protect);

const allowedRoles = ['ADMIN', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'];

router.get('/fleet-utilization', restrictTo(...allowedRoles), analyticsController.getFleetUtilization);
router.get('/fuel-efficiency', restrictTo(...allowedRoles), analyticsController.getFuelEfficiency);
router.get('/vehicle-roi', restrictTo(...allowedRoles), analyticsController.getVehicleROI);
router.get('/driver-performance', restrictTo(...allowedRoles), analyticsController.getDriverPerformance);
router.get('/maintenance', restrictTo(...allowedRoles), analyticsController.getMaintenanceTrends);
router.get('/expenses', restrictTo(...allowedRoles), analyticsController.getExpenseTrends);
router.get('/monthly', restrictTo(...allowedRoles), analyticsController.getMonthlyStatistics);

export default router;
