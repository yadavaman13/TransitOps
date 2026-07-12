import * as fuelLogDao from '../../../dao/fuel-log.dao.js';
import * as vehicleDao from '../../../dao/vehicle.dao.js';
import * as tripDao from '../../../dao/trip.dao.js';
import { getUserById } from '../../../dao/user.dao.js';
import { AppError } from '../../auth/utils/appError.js';

export async function createFuelLog(data, user) {
    const vehicle = await vehicleDao.getVehicleById(data.vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    const driver = await getUserById(data.driverId);
    if (!driver || driver.role !== 'DRIVER') throw new AppError('Driver not found', 404);

    const trip = await tripDao.getTripById(data.tripId);
    if (!trip) throw new AppError('Trip not found', 404);

    if (user.role === 'DRIVER' && data.driverId !== user.id) {
        throw new AppError('You can only create fuel logs for yourself', 403);
    }
    if (user.role === 'DRIVER' && trip.driverId !== user.id) {
        throw new AppError('You are not assigned to this trip', 403);
    }

    const litres = Number(data.litres);
    const pricePerLitre = Number(data.pricePerLitre);
    const odometer = Number(data.odometer);

    if (isNaN(litres) || litres <= 0) throw new AppError('Litres must be greater than 0', 400);
    if (isNaN(pricePerLitre) || pricePerLitre <= 0) throw new AppError('Price per litre must be greater than 0', 400);
    if (isNaN(odometer) || odometer < 0) throw new AppError('Odometer cannot be negative', 400);

    const vehicleOdometer = Number(vehicle.currentOdometer);
    if (odometer < vehicleOdometer) {
        throw new AppError('Odometer reading cannot be less than the vehicle current odometer', 400);
    }

    const totalCost = data.totalCost !== undefined ? Number(data.totalCost) : (litres * pricePerLitre);
    if (isNaN(totalCost) || totalCost < 0) throw new AppError('Total cost cannot be negative', 400);

    const logData = {
        ...data,
        litres: String(litres),
        pricePerLitre: String(pricePerLitre),
        totalCost: String(totalCost.toFixed(2)),
        odometer: String(odometer),
    };

    return fuelLogDao.createFuelLog(logData);
}

export async function getFuelLogs(filters = {}, user) {
    const activeFilters = { ...filters };
    if (user.role === 'DRIVER') {
        activeFilters.driverId = user.id;
    }
    return fuelLogDao.listFuelLogs(activeFilters);
}

export async function getFuelLogDetails(id, user) {
    const log = await fuelLogDao.getFuelLogById(id);
    if (!log) throw new AppError('Fuel log not found', 404);

    if (user.role === 'DRIVER' && log.driverId !== user.id) {
        throw new AppError('You do not have permission to view this fuel log', 403);
    }
    return log;
}

export async function updateFuelLog(id, updates) {
    const existing = await fuelLogDao.getFuelLogById(id);
    if (!existing) throw new AppError('Fuel log not found', 404);

    const merged = { ...existing, ...updates };
    const litres = Number(merged.litres);
    const pricePerLitre = Number(merged.pricePerLitre);
    const odometer = Number(merged.odometer);

    if (isNaN(litres) || litres <= 0) throw new AppError('Litres must be greater than 0', 400);
    if (isNaN(pricePerLitre) || pricePerLitre <= 0) throw new AppError('Price per litre must be greater than 0', 400);
    if (isNaN(odometer) || odometer < 0) throw new AppError('Odometer cannot be negative', 400);

    // Verify reference changes if applicable
    if (updates.vehicleId && updates.vehicleId !== existing.vehicleId) {
        const vehicle = await vehicleDao.getVehicleById(updates.vehicleId);
        if (!vehicle) throw new AppError('Vehicle not found', 404);
    }
    if (updates.driverId && updates.driverId !== existing.driverId) {
        const driver = await getUserById(updates.driverId);
        if (!driver || driver.role !== 'DRIVER') throw new AppError('Driver not found', 404);
    }
    if (updates.tripId && updates.tripId !== existing.tripId) {
        const trip = await tripDao.getTripById(updates.tripId);
        if (!trip) throw new AppError('Trip not found', 404);
    }

    const totalCost = updates.totalCost !== undefined ? Number(updates.totalCost) : (litres * pricePerLitre);

    const finalUpdates = {
        ...updates,
        litres: String(litres),
        pricePerLitre: String(pricePerLitre),
        totalCost: String(totalCost.toFixed(2)),
        odometer: String(odometer),
    };

    return fuelLogDao.updateFuelLog(id, finalUpdates);
}

export async function deleteFuelLog(id) {
    const existing = await fuelLogDao.getFuelLogById(id);
    if (!existing) throw new AppError('Fuel log not found', 404);
    return fuelLogDao.deleteFuelLog(id);
}

export async function getFuelSummary() {
    const metrics = await fuelLogDao.getFuelSummaryMetrics();
    const vehicleBreakdown = await fuelLogDao.getFuelSummaryByVehicle();
    return {
        metrics,
        vehicleBreakdown,
    };
}

export async function getVehicleFuelLogs(vehicleId) {
    const vehicle = await vehicleDao.getVehicleById(vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found', 404);
    return fuelLogDao.getFuelLogsByVehicle(vehicleId);
}
