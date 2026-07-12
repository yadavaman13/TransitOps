import * as financeService from '../services/finance.service.js';
import { sendResponse } from '../../../utils/response.utlis.js';

export async function getDashboardOverview(req, res, next) {
    try {
        const data = await financeService.getDashboardOverview();
        return sendResponse({
            res,
            statusCode: 200,
            message: 'Finance dashboard overview retrieved successfully',
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
}

export async function getExpenses(req, res, next) {
    try {
        const { category, vehicleId, startDate, endDate } = req.query;
        const data = await financeService.getExpensesList({
            category,
            vehicleId,
            startDate,
            endDate
        });
        return sendResponse({
            res,
            statusCode: 200,
            message: 'Expenses list retrieved successfully',
            success: true,
            data: { expenses: data }
        });
    } catch (error) {
        next(error);
    }
}

export async function getFuelLogs(req, res, next) {
    try {
        const data = await financeService.getFuelLogsList();
        return sendResponse({
            res,
            statusCode: 200,
            message: 'Fuel logs list retrieved successfully',
            success: true,
            data: { fuelLogs: data }
        });
    } catch (error) {
        next(error);
    }
}

export async function getReports(req, res, next) {
    try {
        const data = await financeService.getReportsData();
        return sendResponse({
            res,
            statusCode: 200,
            message: 'Reports analytics retrieved successfully',
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
}

export async function createExpense(req, res, next) {
    try {
        const { tripId, vehicleId, category, amount, description, receipt } = req.body;
        const createdBy = req.user.id; // From auth.middleware.js protect

        const expense = await financeService.createExpense({
            tripId,
            vehicleId,
            category,
            amount,
            description,
            receipt,
            createdBy
        });

        return sendResponse({
            res,
            statusCode: 201,
            message: 'Expense record created successfully',
            success: true,
            data: { expense }
        });
    } catch (error) {
        next(error);
    }
}
