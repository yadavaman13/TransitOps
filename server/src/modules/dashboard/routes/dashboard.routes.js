import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { protect } from '../../auth/index.js';

const router = Router();

router.use(protect);

router.get('/', dashboardController.getDashboardOverview);
router.get('/kpis', dashboardController.getDashboardKpis);
router.get('/vehicle-summary', dashboardController.getVehicleSummary);
router.get('/driver-summary', dashboardController.getDriverSummary);
router.get('/trip-summary', dashboardController.getTripSummary);
router.get('/recent-activities', dashboardController.getRecentActivities);

export default router;
