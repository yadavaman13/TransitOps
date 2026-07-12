import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller.js';
import { protect, restrictTo } from '../../auth/index.js';

const router = Router();
router.use(protect);

const allowedReaderRoles = ['ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST', 'DRIVER'];
const allowedWriterRoles = ['ADMIN', 'FLEET_MANAGER', 'DRIVER'];
const allowedModifierRoles = ['ADMIN', 'FLEET_MANAGER'];
const staffReaderRoles = ['ADMIN', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'];

// Summary and specific vehicle query routes (must be registered before /:id)
router.get('/summary', restrictTo(...staffReaderRoles), expenseController.getExpenseSummary);
router.get('/vehicle/:vehicleId', restrictTo(...allowedReaderRoles), expenseController.getVehicleExpenses);

// CRUD routes
router.post('/', restrictTo(...allowedWriterRoles), expenseController.createExpense);
router.get('/', restrictTo(...allowedReaderRoles), expenseController.getExpenses);
router.get('/:id', restrictTo(...allowedReaderRoles), expenseController.getExpenseDetails);
router.patch('/:id', restrictTo(...allowedModifierRoles), expenseController.updateExpense);
router.delete('/:id', restrictTo(...allowedModifierRoles), expenseController.deleteExpense);

export default router;
