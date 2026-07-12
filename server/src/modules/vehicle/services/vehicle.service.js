import * as vehicleDao from '../../../dao/vehicle.dao.js';
import * as tripDao from '../../../dao/trip.dao.js';
import * as maintenanceDao from '../../../dao/maintenance.dao.js';
import * as fuelLogDao from '../../../dao/fuel-log.dao.js';
import * as expenseDao from '../../../dao/expense.dao.js';
import { AppError } from '../../auth/utils/appError.js';
import { db } from '../../../config/database.js';
import { trips } from '../../../db/schema/trips.schema.js';
import { maintenance } from '../../../db/schema/maintenance.schema.js';
import { eq, and, or, inArray } from 'drizzle-orm';

export async function registerVehicle(data) {
    const existing = await vehicleDao.getVehicleByRegistration(data.registrationNumber);
    if (existing) {
        throw new AppError('Vehicle registration number must be unique', 400);
    }

    if (data.manufactureYear < 1900 || data.manufactureYear > 2100) {
        throw new AppError('Manufacture year must be between 1900 and 2100', 400);
    }

    if (Number(data.capacityKg) <= 0) {
        throw new AppError('Cargo capacity must be greater than 0', 400);
    }

    if (Number(data.currentOdometer) < 0) {
        throw new AppError('Current odometer cannot be negative', 400);
    }

    return vehicleDao.createVehicle(data);
}

export async function getVehicles(status) {
    return vehicleDao.listVehicles(status);
}

export async function getVehicleDetails(id) {
    const vehicle = await vehicleDao.getVehicleById(id);
    if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
    }
    return vehicle;
}

export async function updateVehicle(id, updates) {
    const vehicle = await vehicleDao.getVehicleById(id);
    if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
    }

    if (updates.registrationNumber && updates.registrationNumber !== vehicle.registrationNumber) {
        const existing = await vehicleDao.getVehicleByRegistration(updates.registrationNumber);
        if (existing) {
            throw new AppError('Vehicle registration number must be unique', 400);
        }
    }

    if (updates.manufactureYear !== undefined && (updates.manufactureYear < 1900 || updates.manufactureYear > 2100)) {
        throw new AppError('Manufacture year must be between 1900 and 2100', 400);
    }

    if (updates.capacityKg !== undefined && Number(updates.capacityKg) <= 0) {
        throw new AppError('Cargo capacity must be greater than 0', 400);
    }

    return vehicleDao.updateVehicle(id, updates);
}

export async function deleteVehicle(id) {
    const vehicle = await vehicleDao.getVehicleById(id);
    if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
    }

    // Check active trips
    const activeTrips = await db
        .select()
        .from(trips)
        .where(
            and(
                eq(trips.vehicleId, id),
                inArray(trips.status, ['DRAFT', 'DISPATCHED', 'STARTED'])
            )
        )
        .limit(1);

    if (activeTrips.length > 0) {
        throw new AppError('Deleted Vehicle cannot have active trips', 400);
    }

    // Check active maintenance
    const activeMaintenance = await db
        .select()
        .from(maintenance)
        .where(
            and(
                eq(maintenance.vehicleId, id),
                inArray(maintenance.status, ['PENDING', 'IN_PROGRESS'])
            )
        )
        .limit(1);

    if (activeMaintenance.length > 0) {
        throw new AppError('Vehicle has active maintenance logs and cannot be deleted', 400);
    }

    return vehicleDao.deleteVehicle(id);
}

export async function getAvailableVehicles() {
    return vehicleDao.getAvailableVehicles();
}

export async function updateVehicleStatus(id, status) {
    const vehicle = await vehicleDao.getVehicleById(id);
    if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
    }

    const validStatuses = ['AVAILABLE', 'ON_TRIP', 'MAINTENANCE', 'RETIRED'];
    if (!validStatuses.includes(status)) {
        throw new AppError('Invalid status update', 400);
    }

    return vehicleDao.updateVehicle(id, { status });
}

export async function retireVehicle(id) {
    return updateVehicleStatus(id, 'RETIRED');
}

export async function restoreVehicle(id) {
    return updateVehicleStatus(id, 'AVAILABLE');
}

export async function updateVehicleOdometer(id, odometer) {
    const vehicle = await vehicleDao.getVehicleById(id);
    if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
    }

    const newOdo = Number(odometer);
    const currOdo = Number(vehicle.currentOdometer);

    if (isNaN(newOdo) || newOdo < currOdo) {
        throw new AppError('New odometer reading must be greater than or equal to current odometer', 400);
    }

    return vehicleDao.updateVehicle(id, { currentOdometer: String(newOdo) });
}

export async function getVehicleTrips(id) {
    const vehicle = await vehicleDao.getVehicleById(id);
    if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
    }
    return db.select().from(trips).where(eq(trips.vehicleId, id));
}

export async function getVehicleMaintenance(id) {
    const vehicle = await vehicleDao.getVehicleById(id);
    if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
    }
    return maintenanceDao.getMaintenanceByVehicle(id);
}

export async function getVehicleFuelLogs(id) {
    const vehicle = await vehicleDao.getVehicleById(id);
    if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
    }
    return fuelLogDao.getFuelLogsByVehicle(id);
}

export async function getVehicleExpenses(id) {
    const vehicle = await vehicleDao.getVehicleById(id);
    if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
    }
    return expenseDao.getExpensesByVehicle(id);
}
