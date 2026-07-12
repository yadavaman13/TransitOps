import { Router } from 'express';
import * as financeController from '../controllers/finance.controller.js';
import { protect, restrictTo } from '../../auth/index.js';
import { createExpenseValidator } from '../validators/finance.validator.js';

const router = Router();

// Protect all finance routes and restrict to Financial Analysts & Fleet Managers
router.use(protect);
router.use(restrictTo('FINANCIAL_ANALYST', 'FLEET_MANAGER'));

// 1. Dashboard Overview
router.get('/dashboard', financeController.getDashboardOverview);

// 2. Expenses Management
router.get('/expenses', financeController.getExpenses);
router.post(
    '/expenses',
    createExpenseValidator,
    financeController.createExpense
);

// 3. Fuel Log Management
router.get('/fuel', financeController.getFuelLogs);

// 4. Reports & Analytical Insights
router.get('/reports', financeController.getReports);

export default router;
