import * as tripDao from '../../../dao/trip.dao.js';
import * as vehicleDao from '../../../dao/vehicle.dao.js';
import * as driverDao from '../../../dao/driver.dao.js';
import { db } from '../../../config/database.js';
import { fuelLogs } from '../../../db/schema/fuel-logs.schema.js';
import { expenses } from '../../../db/schema/expenses.schema.js';
import { AppError } from '../../auth/utils/appError.js';
import { eq } from 'drizzle-orm';

export async function createTrip(data, createdById) {
    const { vehicleId, driverId, source, destination, cargoName, cargoWeight, distanceKm, plannedStart, plannedEnd, remarks } = data;

    // Validate vehicle
    const vehicle = await vehicleDao.getVehicleById(vehicleId);
    if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
    }
    if (vehicle.status !== 'AVAILABLE') {
        throw new AppError('Vehicle must be AVAILABLE before assignment', 400);
    }
    if (vehicle.status === 'RETIRED') {
        throw new AppError('Retired Vehicle cannot be dispatched', 400);
    }

    // Validate driver
    const driver = await driverDao.getDriverById(driverId);
    if (!driver) {
        throw new AppError('Driver not found', 404);
    }
    if (driver.availabilityStatus !== 'AVAILABLE') {
        throw new AppError('Driver must be AVAILABLE before assignment', 400);
    }

    // Validate driver license expiry
    const licenseExpiry = new Date(driver.licenseExpiry);
    if (licenseExpiry <= new Date()) {
        throw new AppError('Driver license must not be expired before dispatch', 400);
    }

    // Validate cargo weight
    const weight = Number(cargoWeight);
    const capacity = Number(vehicle.capacityKg);
    if (weight <= 0 || isNaN(weight)) {
        throw new AppError('Cargo weight must be greater than 0', 400);
    }
    if (weight > capacity) {
        throw new AppError('Cargo weight must never exceed vehicle capacity', 400);
    }

    // Validate distance
    const dist = Number(distanceKm);
    if (dist <= 0 || isNaN(dist)) {
        throw new AppError('Distance must be greater than 0', 400);
    }

    const tripNumber = `TRP-${Math.floor(10000 + Math.random() * 90000)}`;

    const tripData = {
        tripNumber,
        vehicleId,
        driverId,
        createdBy: createdById,
        source,
        destination,
        cargoName,
        cargoWeight: String(weight),
        distanceKm: String(dist),
        plannedStart: new Date(plannedStart),
        plannedEnd: new Date(plannedEnd),
        remarks,
        status: 'DRAFT'
    };

    return tripDao.createTrip(tripData);
}

export async function getTrips(filters = {}) {
    return tripDao.listTrips(filters);
}

export async function getTripDetails(id) {
    const trip = await tripDao.getTripById(id);
    if (!trip) {
        throw new AppError('Trip not found', 404);
    }
    return trip;
}

export async function updateTrip(id, updates) {
    const trip = await tripDao.getTripById(id);
    if (!trip) {
        throw new AppError('Trip not found', 404);
    }

    if (trip.status !== 'DRAFT') {
        throw new AppError('Only DRAFT trips can be updated', 400);
    }

    // If vehicle is updated
    if (updates.vehicleId && updates.vehicleId !== trip.vehicleId) {
        const vehicle = await vehicleDao.getVehicleById(updates.vehicleId);
        if (!vehicle) {
            throw new AppError('Vehicle not found', 404);
        }
        if (vehicle.status !== 'AVAILABLE') {
            throw new AppError('Vehicle must be AVAILABLE before assignment', 400);
        }
        const weight = updates.cargoWeight ? Number(updates.cargoWeight) : Number(trip.cargoWeight);
        if (weight > Number(vehicle.capacityKg)) {
            throw new AppError('Cargo weight must never exceed vehicle capacity', 400);
        }
    }

    // If driver is updated
    if (updates.driverId && updates.driverId !== trip.driverId) {
        const driver = await driverDao.getDriverById(updates.driverId);
        if (!driver) {
            throw new AppError('Driver not found', 404);
        }
        if (driver.availabilityStatus !== 'AVAILABLE') {
            throw new AppError('Driver must be AVAILABLE before assignment', 400);
        }
        const expiry = new Date(driver.licenseExpiry);
        if (expiry <= new Date()) {
            throw new AppError('Driver license must not be expired before dispatch', 400);
        }
    }

    const tripUpdates = {};
    if (updates.source) tripUpdates.source = updates.source;
    if (updates.destination) tripUpdates.destination = updates.destination;
    if (updates.cargoName) tripUpdates.cargoName = updates.cargoName;
    if (updates.cargoWeight !== undefined) {
        const weight = Number(updates.cargoWeight);
        if (weight <= 0) throw new AppError('Cargo weight must be greater than 0', 400);
        tripUpdates.cargoWeight = String(weight);
    }
    if (updates.distanceKm !== undefined) {
        const dist = Number(updates.distanceKm);
        if (dist <= 0) throw new AppError('Distance must be greater than 0', 400);
        tripUpdates.distanceKm = String(dist);
    }
    if (updates.plannedStart) tripUpdates.plannedStart = new Date(updates.plannedStart);
    if (updates.plannedEnd) tripUpdates.plannedEnd = new Date(updates.plannedEnd);
    if (updates.remarks) tripUpdates.remarks = updates.remarks;
    if (updates.vehicleId) tripUpdates.vehicleId = updates.vehicleId;
    if (updates.driverId) tripUpdates.driverId = updates.driverId;

    return tripDao.updateTrip(id, tripUpdates);
}

export async function deleteTrip(id) {
    const trip = await tripDao.getTripById(id);
    if (!trip) {
        throw new AppError('Trip not found', 404);
    }

    if (trip.status !== 'DRAFT' && trip.status !== 'CANCELLED') {
        throw new AppError('Only DRAFT or CANCELLED trips can be deleted', 400);
    }

    return tripDao.deleteTrip(id);
}

export async function dispatchTrip(id) {
    const trip = await tripDao.getTripById(id);
    if (!trip) {
        throw new AppError('Trip not found', 404);
    }

    if (trip.status !== 'DRAFT') {
        throw new AppError('Trip must start as DRAFT before dispatch', 400);
    }

    // Verify vehicle is not retired and is available
    const vehicle = await vehicleDao.getVehicleById(trip.vehicleId);
    if (!vehicle) {
        throw new AppError('Vehicle assigned to trip not found', 404);
    }
    if (vehicle.status === 'RETIRED') {
        throw new AppError('Retired Vehicle cannot be dispatched', 400);
    }
    if (vehicle.status === 'MAINTENANCE') {
        throw new AppError('Vehicle under maintenance cannot be assigned or dispatched', 400);
    }

    // Verify driver license is not expired
    const driver = await driverDao.getDriverById(trip.driverId);
    if (!driver) {
        throw new AppError('Driver assigned to trip not found', 404);
    }
    const expiry = new Date(driver.licenseExpiry);
    if (expiry <= new Date()) {
        throw new AppError('Driver with an expired license cannot be dispatched', 400);
    }

    return tripDao.dispatchTripTx(id, trip.vehicleId, trip.driverId);
}

export async function startTrip(id) {
    const trip = await tripDao.getTripById(id);
    if (!trip) {
        throw new AppError('Trip not found', 404);
    }

    if (trip.status !== 'DISPATCHED') {
        throw new AppError('Start Trip only allowed if Trip is DISPATCHED', 400);
    }

    return tripDao.updateTrip(id, {
        status: 'STARTED',
        actualStart: new Date(),
    });
}

export async function completeTrip(id, data) {
    const trip = await tripDao.getTripById(id);
    if (!trip) {
        throw new AppError('Trip not found', 404);
    }

    if (trip.status !== 'STARTED' && trip.status !== 'DISPATCHED') {
        throw new AppError('Trip cannot be completed unless it has been dispatched or started', 400);
    }

    const vehicle = await vehicleDao.getVehicleById(trip.vehicleId);
    if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
    }

    const actualDist = data.actualDistance ? Number(data.actualDistance) : Number(trip.distanceKm);
    if (actualDist <= 0 || isNaN(actualDist)) {
        throw new AppError('Actual distance must be greater than 0', 400);
    }

    const currOdo = Number(vehicle.currentOdometer);
    const newOdo = currOdo + actualDist;

    const actualEnd = data.actualEnd ? new Date(data.actualEnd) : new Date();

    return tripDao.completeTripTx(
        id,
        trip.vehicleId,
        trip.driverId,
        actualDist,
        actualEnd,
        data.remarks,
        newOdo
    );
}

export async function cancelTrip(id) {
    const trip = await tripDao.getTripById(id);
    if (!trip) {
        throw new AppError('Trip not found', 404);
    }

    if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
        throw new AppError('Completed or already Cancelled trips cannot be cancelled', 400);
    }

    // Restores vehicle & driver availability if DISPATCHED or STARTED
    const shouldRestore = trip.status === 'DISPATCHED' || trip.status === 'STARTED';

    return tripDao.cancelTripTx(id, trip.vehicleId, trip.driverId, shouldRestore);
}

export async function assignDriver(id, driverId) {
    const trip = await tripDao.getTripById(id);
    if (!trip) {
        throw new AppError('Trip not found', 404);
    }

    if (trip.status !== 'DRAFT') {
        throw new AppError('Driver can only be assigned to DRAFT trips', 400);
    }

    const driver = await driverDao.getDriverById(driverId);
    if (!driver) {
        throw new AppError('Driver not found', 404);
    }

    if (driver.availabilityStatus !== 'AVAILABLE') {
        throw new AppError('Driver must be AVAILABLE before assignment', 400);
    }

    const expiry = new Date(driver.licenseExpiry);
    if (expiry <= new Date()) {
        throw new AppError('Driver license must not be expired', 400);
    }

    return tripDao.updateTrip(id, { driverId });
}

export async function assignVehicle(id, vehicleId) {
    const trip = await tripDao.getTripById(id);
    if (!trip) {
        throw new AppError('Trip not found', 404);
    }

    if (trip.status !== 'DRAFT') {
        throw new AppError('Vehicle can only be assigned to DRAFT trips', 400);
    }

    const vehicle = await vehicleDao.getVehicleById(vehicleId);
    if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
    }

    if (vehicle.status !== 'AVAILABLE') {
        throw new AppError('Vehicle must be AVAILABLE before assignment', 400);
    }

    if (Number(trip.cargoWeight) > Number(vehicle.capacityKg)) {
        throw new AppError('Cargo weight must never exceed vehicle capacity', 400);
    }

    return tripDao.updateTrip(id, { vehicleId });
}

export async function updateCargo(id, cargoName, cargoWeight) {
    const trip = await tripDao.getTripById(id);
    if (!trip) {
        throw new AppError('Trip not found', 404);
    }

    if (trip.status !== 'DRAFT') {
        throw new AppError('Cargo can only be updated for DRAFT trips', 400);
    }

    const weight = Number(cargoWeight);
    if (weight <= 0 || isNaN(weight)) {
        throw new AppError('Cargo weight must be greater than 0', 400);
    }

    const vehicle = await vehicleDao.getVehicleById(trip.vehicleId);
    if (vehicle && weight > Number(vehicle.capacityKg)) {
        throw new AppError('Cargo weight must never exceed vehicle capacity', 400);
    }

    return tripDao.updateTrip(id, { cargoName, cargoWeight: String(weight) });
}

export async function updateDistance(id, distanceKm) {
    const trip = await tripDao.getTripById(id);
    if (!trip) {
        throw new AppError('Trip not found', 404);
    }

    if (trip.status !== 'DRAFT') {
        throw new AppError('Distance can only be updated for DRAFT trips', 400);
    }

    const dist = Number(distanceKm);
    if (dist <= 0 || isNaN(dist)) {
        throw new AppError('Distance must be greater than 0', 400);
    }

    return tripDao.updateTrip(id, { distanceKm: String(dist) });
}

export async function getTripTimeline(id) {
    const trip = await getTripDetails(id);

    const fuel = await db
        .select()
        .from(fuelLogs)
        .where(eq(fuelLogs.tripId, id));

    const exp = await db
        .select()
        .from(expenses)
        .where(eq(expenses.tripId, id));

    return {
        trip,
        fuelLogs: fuel,
        expenses: exp,
    };
}
