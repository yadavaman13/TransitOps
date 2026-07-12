import { db } from '../config/database.js';
import { trips } from '../db/schema/trips.schema.js';
import { vehicles } from '../db/schema/vehicles.schema.js';
import { driverProfiles } from '../db/schema/driver-profiles.schema.js';
import { users } from '../db/schema/users.schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

const driverUser = alias(users, 'driver_user');
const creatorUser = alias(users, 'creator_user');

export async function createTrip(data) {
    const [trip] = await db.insert(trips).values(data).returning();
    return trip;
}

export async function getTripById(id) {
    const rows = await db
        .select({
            id: trips.id,
            tripNumber: trips.tripNumber,
            vehicleId: trips.vehicleId,
            driverId: trips.driverId,
            createdBy: trips.createdBy,
            source: trips.source,
            destination: trips.destination,
            cargoName: trips.cargoName,
            cargoWeight: trips.cargoWeight,
            distanceKm: trips.distanceKm,
            plannedStart: trips.plannedStart,
            plannedEnd: trips.plannedEnd,
            actualStart: trips.actualStart,
            actualEnd: trips.actualEnd,
            status: trips.status,
            remarks: trips.remarks,
            createdAt: trips.createdAt,
            updatedAt: trips.updatedAt,
            vehicle: {
                registrationNumber: vehicles.registrationNumber,
                brand: vehicles.brand,
                model: vehicles.model,
                capacityKg: vehicles.capacityKg,
                currentOdometer: vehicles.currentOdometer,
            },
            driver: {
                id: driverUser.id,
                name: driverUser.name,
                email: driverUser.email,
            },
            creator: {
                id: creatorUser.id,
                name: creatorUser.name,
                email: creatorUser.email,
            }
        })
        .from(trips)
        .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
        .leftJoin(driverUser, eq(trips.driverId, driverUser.id))
        .leftJoin(creatorUser, eq(trips.createdBy, creatorUser.id))
        .where(eq(trips.id, id));

    return rows[0] || null;
}

export async function listTrips(filters = {}) {
    const driverUserList = alias(users, 'driver_user_list');
    const creatorUserList = alias(users, 'creator_user_list');
    
    let query = db
        .select({
            id: trips.id,
            tripNumber: trips.tripNumber,
            vehicleId: trips.vehicleId,
            driverId: trips.driverId,
            createdBy: trips.createdBy,
            source: trips.source,
            destination: trips.destination,
            cargoName: trips.cargoName,
            cargoWeight: trips.cargoWeight,
            distanceKm: trips.distanceKm,
            plannedStart: trips.plannedStart,
            plannedEnd: trips.plannedEnd,
            actualStart: trips.actualStart,
            actualEnd: trips.actualEnd,
            status: trips.status,
            remarks: trips.remarks,
            createdAt: trips.createdAt,
            updatedAt: trips.updatedAt,
            vehicle: {
                registrationNumber: vehicles.registrationNumber,
                brand: vehicles.brand,
                model: vehicles.model,
            },
            driver: {
                id: driverUserList.id,
                name: driverUserList.name,
                email: driverUserList.email,
            },
        })
        .from(trips)
        .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
        .leftJoin(driverUserList, eq(trips.driverId, driverUserList.id))
        .leftJoin(creatorUserList, eq(trips.createdBy, creatorUserList.id));

    const whereConditions = [];
    if (filters.status) {
        whereConditions.push(eq(trips.status, filters.status));
    }
    if (filters.driverId) {
        whereConditions.push(eq(trips.driverId, filters.driverId));
    }
    if (filters.vehicleId) {
        whereConditions.push(eq(trips.vehicleId, filters.vehicleId));
    }

    if (whereConditions.length > 0) {
        query = query.where(and(...whereConditions));
    }

    return query.orderBy(desc(trips.createdAt));
}

export async function updateTrip(id, updates) {
    const [trip] = await db
        .update(trips)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(trips.id, id))
        .returning();
    return trip || null;
}

export async function deleteTrip(id) {
    const [trip] = await db
        .delete(trips)
        .where(eq(trips.id, id))
        .returning();
    return trip || null;
}

export async function dispatchTripTx(tripId, vehicleId, driverId) {
    return await db.transaction(async (tx) => {
        // 1. Update trip status
        const [trip] = await tx
            .update(trips)
            .set({ status: 'DISPATCHED', updatedAt: new Date() })
            .where(eq(trips.id, tripId))
            .returning();

        // 2. Update vehicle status to ON_TRIP
        await tx
            .update(vehicles)
            .set({ status: 'ON_TRIP', updatedAt: new Date() })
            .where(eq(vehicles.id, vehicleId));

        // 3. Update driver status to ON_TRIP
        await tx
            .update(driverProfiles)
            .set({ availabilityStatus: 'ON_TRIP', updatedAt: new Date() })
            .where(eq(driverProfiles.userId, driverId));

        return trip;
    });
}

export async function completeTripTx(tripId, vehicleId, driverId, actualDistance, actualEnd, remarks, newOdometer) {
    return await db.transaction(async (tx) => {
        // 1. Update trip status
        const [trip] = await tx
            .update(trips)
            .set({
                status: 'COMPLETED',
                actualEnd,
                distanceKm: actualDistance, // actual distance completed
                remarks: remarks || trips.remarks,
                updatedAt: new Date()
            })
            .where(eq(trips.id, tripId))
            .returning();

        // 2. Update vehicle status and odometer
        await tx
            .update(vehicles)
            .set({
                status: 'AVAILABLE',
                currentOdometer: String(newOdometer),
                updatedAt: new Date()
            })
            .where(eq(vehicles.id, vehicleId));

        // 3. Update driver status
        await tx
            .update(driverProfiles)
            .set({ availabilityStatus: 'AVAILABLE', updatedAt: new Date() })
            .where(eq(driverProfiles.userId, driverId));

        return trip;
    });
}

export async function cancelTripTx(tripId, vehicleId, driverId, shouldRestoreAvailability) {
    return await db.transaction(async (tx) => {
        const [trip] = await tx
            .update(trips)
            .set({ status: 'CANCELLED', updatedAt: new Date() })
            .where(eq(trips.id, tripId))
            .returning();

        if (shouldRestoreAvailability) {
            await tx
                .update(vehicles)
                .set({ status: 'AVAILABLE', updatedAt: new Date() })
                .where(eq(vehicles.id, vehicleId));

            await tx
                .update(driverProfiles)
                .set({ availabilityStatus: 'AVAILABLE', updatedAt: new Date() })
                .where(eq(driverProfiles.userId, driverId));
        }

        return trip;
    });
}

export async function hasActiveTripsForVehicle(vehicleId) {
    const active = await db
        .select()
        .from(trips)
        .where(
            and(
                eq(trips.vehicleId, vehicleId),
                and(
                    eq(trips.status, 'DISPATCHED'),
                    eq(trips.status, 'STARTED')
                )
            )
        )
        .limit(1);
    return active.length > 0;
}

export async function hasActiveTripsForDriver(driverId) {
    const active = await db
        .select()
        .from(trips)
        .where(
            and(
                eq(trips.driverId, driverId),
                and(
                    eq(trips.status, 'DISPATCHED'),
                    eq(trips.status, 'STARTED')
                )
            )
        )
        .limit(1);
    return active.length > 0;
}
