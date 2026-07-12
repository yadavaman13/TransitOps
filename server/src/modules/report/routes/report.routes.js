import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { protect, restrictTo } from '../../auth/index.js';

const router = Router();
router.use(protect);

const allowedRoles = ['ADMIN', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'];

router.get('/fleet', restrictTo(...allowedRoles), reportController.getFleetReport);
router.get('/drivers', restrictTo(...allowedRoles), reportController.getDriverReport);
router.get('/trips', restrictTo(...allowedRoles), reportController.getTripReport);
router.get('/expenses', restrictTo(...allowedRoles), reportController.getExpenseReport);
router.get('/operational-cost', restrictTo(...allowedRoles), reportController.getOperationalCostReport);

router.get('/export/csv', restrictTo(...allowedRoles), reportController.exportCSV);
router.get('/export/pdf', restrictTo(...allowedRoles), reportController.exportPDF);

export default router;
