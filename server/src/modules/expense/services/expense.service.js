import * as expenseDao from '../../../dao/expense.dao.js';
import * as vehicleDao from '../../../dao/vehicle.dao.js';
import * as tripDao from '../../../dao/trip.dao.js';
import { AppError } from '../../auth/utils/appError.js';

const VALID_CATEGORIES = ['Fuel', 'Toll', 'Parking', 'Repair', 'Insurance', 'Misc'];

export async function createExpense(data, user) {
    const vehicle = await vehicleDao.getVehicleById(data.vehicleId);
    if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
    }

    if (data.tripId) {
        const trip = await tripDao.getTripById(data.tripId);
        if (!trip) {
            throw new AppError('Trip not found', 404);
        }
        if (user.role === 'DRIVER') {
            if (trip.driverId !== user.id) {
                throw new AppError('You are not assigned to this trip', 403);
            }
            if (trip.vehicleId !== data.vehicleId) {
                throw new AppError('Vehicle ID does not match the trip vehicle', 400);
            }
        }
    }

    if (!data.category) {
        throw new AppError('Expense category is required', 400);
    }
    const matchedCategory = VALID_CATEGORIES.find(c => c.toLowerCase() === data.category.toLowerCase());
    if (!matchedCategory) {
        throw new AppError(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`, 400);
    }

    const amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) {
        throw new AppError('Amount must be greater than 0', 400);
    }

    const expenseData = {
        vehicleId: data.vehicleId,
        tripId: data.tripId || null,
        category: matchedCategory,
        amount: String(amount.toFixed(2)),
        description: data.description || null,
        receipt: data.receipt || null,
        createdBy: user.id,
    };

    return expenseDao.createExpense(expenseData);
}

export async function getExpenses(filters = {}, user) {
    const activeFilters = { ...filters };
    if (user.role === 'DRIVER') {
        activeFilters.createdBy = user.id;
    }
    return expenseDao.listExpenses(activeFilters);
}

export async function getExpenseDetails(id, user) {
    const record = await expenseDao.getExpenseById(id);
    if (!record) {
        throw new AppError('Expense record not found', 404);
    }

    if (user.role === 'DRIVER' && record.createdBy !== user.id) {
        throw new AppError('You do not have permission to view this expense', 403);
    }

    return record;
}

export async function updateExpense(id, updates) {
    const existing = await expenseDao.getExpenseById(id);
    if (!existing) {
        throw new AppError('Expense record not found', 404);
    }

    const merged = { ...existing, ...updates };

    if (updates.vehicleId && updates.vehicleId !== existing.vehicleId) {
        const vehicle = await vehicleDao.getVehicleById(updates.vehicleId);
        if (!vehicle) {
            throw new AppError('Vehicle not found', 404);
        }
    }

    if (updates.tripId && updates.tripId !== existing.tripId) {
        const trip = await tripDao.getTripById(updates.tripId);
        if (!trip) {
            throw new AppError('Trip not found', 404);
        }
    }

    let matchedCategory = existing.category;
    if (updates.category) {
        const found = VALID_CATEGORIES.find(c => c.toLowerCase() === updates.category.toLowerCase());
        if (!found) {
            throw new AppError(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`, 400);
        }
        matchedCategory = found;
    }

    let amount = Number(merged.amount);
    if (updates.amount !== undefined) {
        amount = Number(updates.amount);
        if (isNaN(amount) || amount <= 0) {
            throw new AppError('Amount must be greater than 0', 400);
        }
    }

    const finalUpdates = {
        vehicleId: updates.vehicleId !== undefined ? updates.vehicleId : existing.vehicleId,
        tripId: updates.tripId !== undefined ? updates.tripId : existing.tripId,
        category: matchedCategory,
        amount: String(amount.toFixed(2)),
        description: updates.description !== undefined ? updates.description : existing.description,
        receipt: updates.receipt !== undefined ? updates.receipt : existing.receipt,
    };

    return expenseDao.updateExpense(id, finalUpdates);
}

export async function deleteExpense(id) {
    const existing = await expenseDao.getExpenseById(id);
    if (!existing) {
        throw new AppError('Expense record not found', 404);
    }
    return expenseDao.deleteExpense(id);
}

export async function getVehicleExpenses(vehicleId, user) {
    const vehicle = await vehicleDao.getVehicleById(vehicleId);
    if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
    }

    if (user.role === 'DRIVER') {
        return expenseDao.listExpenses({ vehicleId, createdBy: user.id });
    }

    return expenseDao.getExpensesByVehicle(vehicleId);
}

export async function getExpenseSummary() {
    const metrics = await expenseDao.getExpenseSummaryMetrics();
    const vehicleBreakdown = await expenseDao.getExpenseSummaryByVehicle();
    return {
        metrics,
        vehicleBreakdown,
    };
}
