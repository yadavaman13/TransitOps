import * as expenseService from '../services/expense.service.js';

export async function createExpense(req, res, next) {
    try {
        const data = await expenseService.createExpense(req.body, req.user);
        return res.status(201).json({
            success: true,
            message: 'Expense record created successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getExpenses(req, res, next) {
    try {
        const filters = {
            category: req.query.category,
            vehicleId: req.query.vehicleId,
            tripId: req.query.tripId,
        };
        const data = await expenseService.getExpenses(filters, req.user);
        return res.status(200).json({
            success: true,
            message: 'Expenses retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getExpenseDetails(req, res, next) {
    try {
        const data = await expenseService.getExpenseDetails(req.params.id, req.user);
        return res.status(200).json({
            success: true,
            message: 'Expense details retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateExpense(req, res, next) {
    try {
        const data = await expenseService.updateExpense(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: 'Expense updated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteExpense(req, res, next) {
    try {
        await expenseService.deleteExpense(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Expense deleted successfully',
            data: null,
        });
    } catch (error) {
        next(error);
    }
}

export async function getVehicleExpenses(req, res, next) {
    try {
        const data = await expenseService.getVehicleExpenses(req.params.vehicleId, req.user);
        return res.status(200).json({
            success: true,
            message: 'Vehicle expenses retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getExpenseSummary(req, res, next) {
    try {
        const data = await expenseService.getExpenseSummary();
        return res.status(200).json({
            success: true,
            message: 'Expense summary retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}
