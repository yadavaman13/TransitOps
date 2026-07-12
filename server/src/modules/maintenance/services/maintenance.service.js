import * as maintenanceDao from '../../../dao/maintenance.dao.js';
import * as vehicleDao from '../../../dao/vehicle.dao.js';
import { AppError } from '../../auth/utils/appError.js';

const VALID_MAINTENANCE_TYPES = ['Repair', 'Oil Change', 'Tyres', 'Insurance', 'General Service'];
const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export async function createMaintenance(data) {
    const vehicle = await vehicleDao.getVehicleById(data.vehicleId);
    if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
    }

    if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
        throw new AppError('Title is required and must be a valid string', 400);
    }

    if (!data.maintenanceType) {
        throw new AppError('Maintenance type is required', 400);
    }
    const matchedType = VALID_MAINTENANCE_TYPES.find(t => t.toLowerCase() === data.maintenanceType.toLowerCase());
    if (!matchedType) {
        throw new AppError(`Invalid maintenance type. Must be one of: ${VALID_MAINTENANCE_TYPES.join(', ')}`, 400);
    }

    const cost = Number(data.cost);
    if (isNaN(cost) || cost < 0) {
        throw new AppError('Cost must be a non-negative number', 400);
    }

    if (!data.scheduledDate) {
        throw new AppError('Scheduled date is required', 400);
    }
    const scheduledDate = new Date(data.scheduledDate);
    if (isNaN(scheduledDate.getTime())) {
        throw new AppError('Invalid scheduled date format', 400);
    }

    let status = data.status ? data.status.toUpperCase() : 'PENDING';
    if (!VALID_STATUSES.includes(status)) {
        throw new AppError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }

    // Side-effects on vehicle status
    if (status === 'IN_PROGRESS') {
        const hasActive = await maintenanceDao.hasActiveMaintenance(data.vehicleId);
        if (hasActive) {
            throw new AppError('Vehicle already has an active maintenance record', 400);
        }
        if (vehicle.status === 'ON_TRIP') {
            throw new AppError('Vehicle is currently on a trip and cannot start maintenance', 400);
        }
        if (vehicle.status === 'RETIRED') {
            throw new AppError('Retired vehicles cannot start maintenance', 400);
        }
        await vehicleDao.updateVehicle(data.vehicleId, { status: 'MAINTENANCE' });
    }

    const recordData = {
        vehicleId: data.vehicleId,
        title: data.title.trim(),
        description: data.description || null,
        maintenanceType: matchedType,
        cost: String(cost.toFixed(2)),
        serviceCenter: data.serviceCenter || null,
        scheduledDate,
        status,
    };

    if (status === 'COMPLETED') {
        recordData.completedDate = data.completedDate ? new Date(data.completedDate) : new Date();
    }

    return maintenanceDao.createMaintenanceRecord(recordData);
}

export async function getMaintenanceRecords(filters = {}) {
    const activeFilters = {};
    if (filters.status) {
        const status = filters.status.toUpperCase();
        if (VALID_STATUSES.includes(status)) {
            activeFilters.status = status;
        }
    }
    if (filters.maintenanceType) {
        const matchedType = VALID_MAINTENANCE_TYPES.find(t => t.toLowerCase() === filters.maintenanceType.toLowerCase());
        if (matchedType) {
            activeFilters.maintenanceType = matchedType;
        }
    }
    if (filters.vehicleId) {
        activeFilters.vehicleId = filters.vehicleId;
    }
    return maintenanceDao.listMaintenance(activeFilters);
}

export async function getMaintenanceDetails(id) {
    const record = await maintenanceDao.getMaintenanceById(id);
    if (!record) {
        throw new AppError('Maintenance record not found', 404);
    }
    return record;
}

export async function updateMaintenance(id, updates) {
    const existing = await maintenanceDao.getMaintenanceById(id);
    if (!existing) {
        throw new AppError('Maintenance record not found', 404);
    }

    if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
        throw new AppError('Cannot update maintenance record in a terminal state', 400);
    }

    const merged = { ...existing, ...updates };

    if (updates.vehicleId && updates.vehicleId !== existing.vehicleId) {
        if (existing.status === 'IN_PROGRESS') {
            throw new AppError('Cannot change vehicle for an active maintenance record', 400);
        }
        const vehicle = await vehicleDao.getVehicleById(updates.vehicleId);
        if (!vehicle) {
            throw new AppError('Vehicle not found', 404);
        }
    }

    let matchedType = existing.maintenanceType;
    if (updates.maintenanceType) {
        const found = VALID_MAINTENANCE_TYPES.find(t => t.toLowerCase() === updates.maintenanceType.toLowerCase());
        if (!found) {
            throw new AppError(`Invalid maintenance type. Must be one of: ${VALID_MAINTENANCE_TYPES.join(', ')}`, 400);
        }
        matchedType = found;
    }

    let cost = Number(merged.cost);
    if (updates.cost !== undefined) {
        cost = Number(updates.cost);
        if (isNaN(cost) || cost < 0) {
            throw new AppError('Cost must be a non-negative number', 400);
        }
    }

    let scheduledDate = existing.scheduledDate;
    if (updates.scheduledDate) {
        scheduledDate = new Date(updates.scheduledDate);
        if (isNaN(scheduledDate.getTime())) {
            throw new AppError('Invalid scheduled date format', 400);
        }
    }

    const finalUpdates = {
        title: updates.title !== undefined ? updates.title.trim() : existing.title,
        description: updates.description !== undefined ? updates.description : existing.description,
        maintenanceType: matchedType,
        cost: String(cost.toFixed(2)),
        serviceCenter: updates.serviceCenter !== undefined ? updates.serviceCenter : existing.serviceCenter,
        scheduledDate,
    };

    if (updates.status) {
        const newStatus = updates.status.toUpperCase();
        if (!VALID_STATUSES.includes(newStatus)) {
            throw new AppError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
        }

        if (newStatus !== existing.status) {
            if (newStatus === 'IN_PROGRESS') {
                const hasActive = await maintenanceDao.hasActiveMaintenance(existing.vehicleId);
                if (hasActive) {
                    throw new AppError('Vehicle already has an active maintenance record', 400);
                }
                const vehicle = await vehicleDao.getVehicleById(existing.vehicleId);
                if (vehicle.status === 'ON_TRIP') {
                    throw new AppError('Vehicle is currently on a trip and cannot start maintenance', 400);
                }
                if (vehicle.status === 'RETIRED') {
                    throw new AppError('Retired vehicles cannot start maintenance', 400);
                }
                await vehicleDao.updateVehicle(existing.vehicleId, { status: 'MAINTENANCE' });
            } else if (newStatus === 'COMPLETED') {
                finalUpdates.completedDate = new Date();
                if (existing.status === 'IN_PROGRESS') {
                    await vehicleDao.updateVehicle(existing.vehicleId, { status: 'AVAILABLE' });
                }
            } else if (newStatus === 'CANCELLED') {
                if (existing.status === 'IN_PROGRESS') {
                    await vehicleDao.updateVehicle(existing.vehicleId, { status: 'AVAILABLE' });
                }
            } else if (newStatus === 'PENDING') {
                if (existing.status === 'IN_PROGRESS') {
                    await vehicleDao.updateVehicle(existing.vehicleId, { status: 'AVAILABLE' });
                }
            }
            finalUpdates.status = newStatus;
        }
    }

    return maintenanceDao.updateMaintenanceRecord(id, finalUpdates);
}

export async function closeMaintenance(id) {
    const record = await maintenanceDao.getMaintenanceById(id);
    if (!record) {
        throw new AppError('Maintenance record not found', 404);
    }

    if (record.status === 'COMPLETED' || record.status === 'CANCELLED') {
        throw new AppError('Maintenance record is already in a terminal state', 400);
    }

    if (record.status === 'IN_PROGRESS') {
        await vehicleDao.updateVehicle(record.vehicleId, { status: 'AVAILABLE' });
    }

    return maintenanceDao.updateMaintenanceRecord(id, {
        status: 'COMPLETED',
        completedDate: new Date(),
    });
}

export async function cancelMaintenance(id) {
    const record = await maintenanceDao.getMaintenanceById(id);
    if (!record) {
        throw new AppError('Maintenance record not found', 404);
    }

    if (record.status === 'COMPLETED' || record.status === 'CANCELLED') {
        throw new AppError('Maintenance record is already in a terminal state', 400);
    }

    if (record.status === 'IN_PROGRESS') {
        await vehicleDao.updateVehicle(record.vehicleId, { status: 'AVAILABLE' });
    }

    return maintenanceDao.updateMaintenanceRecord(id, {
        status: 'CANCELLED',
    });
}

export async function getActiveMaintenance() {
    return maintenanceDao.getActiveMaintenance();
}

export async function getVehicleMaintenanceHistory(vehicleId) {
    const vehicle = await vehicleDao.getVehicleById(vehicleId);
    if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
    }
    return maintenanceDao.getMaintenanceByVehicle(vehicleId);
}
