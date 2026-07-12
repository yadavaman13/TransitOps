import { db } from '../../../config/database.js';
import { vehicles } from '../../../db/schema/vehicles.schema.js';
import { users } from '../../../db/schema/users.schema.js';
import { driverProfiles } from '../../../db/schema/driver-profiles.schema.js';
import { trips } from '../../../db/schema/trips.schema.js';
import { ilike, or, eq, sql } from 'drizzle-orm';

/**
 * Search vehicles by registration number, brand, or model
 */
export async function searchVehicles(query, { limit = 20, offset = 0 } = {}) {
    const pattern = `%${query}%`;
    return db
        .select()
        .from(vehicles)
        .where(
            or(
                ilike(vehicles.registrationNumber, pattern),
                ilike(vehicles.brand, pattern),
                ilike(vehicles.model, pattern),
                ilike(vehicles.vehicleNumber, pattern)
            )
        )
        .limit(limit)
        .offset(offset);
}

/**
 * Search drivers by name, email, or license number
 */
export async function searchDrivers(query, { limit = 20, offset = 0 } = {}) {
    const pattern = `%${query}%`;
    return db
        .select({
            id: driverProfiles.id,
            userId: driverProfiles.userId,
            licenseNumber: driverProfiles.licenseNumber,
            phone: driverProfiles.phone,
            availabilityStatus: driverProfiles.availabilityStatus,
            safetyScore: driverProfiles.safetyScore,
            name: users.name,
            email: users.email,
        })
        .from(driverProfiles)
        .innerJoin(users, eq(driverProfiles.userId, users.id))
        .where(
            or(
                ilike(users.name, pattern),
                ilike(users.email, pattern),
                ilike(driverProfiles.licenseNumber, pattern),
                ilike(driverProfiles.phone, pattern)
            )
        )
        .limit(limit)
        .offset(offset);
}

/**
 * Search trips by trip number, source, destination, or cargo name
 */
export async function searchTrips(query, { limit = 20, offset = 0 } = {}) {
    const pattern = `%${query}%`;
    return db
        .select()
        .from(trips)
        .where(
            or(
                ilike(trips.tripNumber, pattern),
                ilike(trips.source, pattern),
                ilike(trips.destination, pattern),
                ilike(trips.cargoName, pattern)
            )
        )
        .limit(limit)
        .offset(offset);
}

/**
 * Global search across vehicles, drivers, and trips
 */
export async function globalSearch(query, { limit = 10 } = {}) {
    const [vehicleResults, driverResults, tripResults] = await Promise.all([
        searchVehicles(query, { limit }),
        searchDrivers(query, { limit }),
        searchTrips(query, { limit }),
    ]);

    return {
        vehicles: vehicleResults,
        drivers: driverResults,
        trips: tripResults,
    };
}
