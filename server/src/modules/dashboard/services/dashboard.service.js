import { db } from '../../../config/database.js';
import { vehicles } from '../../../db/schema/vehicles.schema.js';
import { users } from '../../../db/schema/users.schema.js';
import { driverProfiles } from '../../../db/schema/driver-profiles.schema.js';
import { trips } from '../../../db/schema/trips.schema.js';
import { fuelLogs } from '../../../db/schema/fuel-logs.schema.js';
import { expenses } from '../../../db/schema/expenses.schema.js';
import { eq, and, sql, desc, or, inArray } from 'drizzle-orm';

export async function getDashboardKpis() {
    const [vCount] = await db.select({ count: sql`count(*)` }).from(vehicles);
    const [vAvailable] = await db.select({ count: sql`count(*)` }).from(vehicles).where(eq(vehicles.status, 'AVAILABLE'));
    const [vMaintenance] = await db.select({ count: sql`count(*)` }).from(vehicles).where(eq(vehicles.status, 'MAINTENANCE'));
    
    const [dCount] = await db.select({ count: sql`count(*)` }).from(users).where(and(eq(users.role, 'Driver'), eq(users.isDeleted, false)));
    
    const [tActive] = await db.select({ count: sql`count(*)` }).from(trips).where(inArray(trips.status, ['DISPATCHED', 'STARTED']));
    
    const [fCost] = await db.select({ total: sql`sum(${fuelLogs.totalCost})` }).from(fuelLogs);
    const [expCost] = await db.select({ total: sql`sum(${expenses.amount})` }).from(expenses);

    return {
        totalVehicles: Number(vCount?.count || 0),
        availableVehicles: Number(vAvailable?.count || 0),
        totalDrivers: Number(dCount?.count || 0),
        activeTrips: Number(tActive?.count || 0),
        vehiclesInMaintenance: Number(vMaintenance?.count || 0),
        totalFuelCost: Number(fCost?.total || 0),
        totalExpenses: Number(expCost?.total || 0),
    };
}

export async function getVehicleSummary() {
    const rows = await db
        .select({
            status: vehicles.status,
            count: sql`count(*)`
        })
        .from(vehicles)
        .groupBy(vehicles.status);

    const summary = {
        AVAILABLE: 0,
        ON_TRIP: 0,
        MAINTENANCE: 0,
        RETIRED: 0,
    };

    rows.forEach(r => {
        if (r.status in summary) {
            summary[r.status] = Number(r.count);
        }
    });

    return summary;
}

export async function getDriverSummary() {
    const rows = await db
        .select({
            status: driverProfiles.availabilityStatus,
            count: sql`count(*)`
        })
        .from(driverProfiles)
        .leftJoin(users, eq(users.id, driverProfiles.userId))
        .where(eq(users.isDeleted, false))
        .groupBy(driverProfiles.availabilityStatus);

    const summary = {
        AVAILABLE: 0,
        ON_TRIP: 0,
        ON_LEAVE: 0,
        SUSPENDED: 0,
    };

    rows.forEach(r => {
        if (r.status in summary) {
            summary[r.status] = Number(r.count);
        }
    });

    return summary;
}

export async function getTripSummary() {
    const rows = await db
        .select({
            status: trips.status,
            count: sql`count(*)`
        })
        .from(trips)
        .groupBy(trips.status);

    const summary = {
        DRAFT: 0,
        DISPATCHED: 0,
        STARTED: 0,
        COMPLETED: 0,
        CANCELLED: 0,
    };

    rows.forEach(r => {
        if (r.status in summary) {
            summary[r.status] = Number(r.count);
        }
    });

    return summary;
}

export async function getRecentActivities() {
    // Get last 5 trips
    const recentTrips = await db
        .select({
            id: trips.id,
            tripNumber: trips.tripNumber,
            source: trips.source,
            destination: trips.destination,
            status: trips.status,
            createdAt: trips.createdAt,
        })
        .from(trips)
        .orderBy(desc(trips.createdAt))
        .limit(5);

    // Get last 5 fuel logs
    const recentFuel = await db
        .select({
            id: fuelLogs.id,
            stationName: fuelLogs.stationName,
            totalCost: fuelLogs.totalCost,
            createdAt: fuelLogs.createdAt,
        })
        .from(fuelLogs)
        .orderBy(desc(fuelLogs.createdAt))
        .limit(5);

    return {
        trips: recentTrips,
        fuelLogs: recentFuel,
    };
}

export async function getDashboardOverview() {
    const kpis = await getDashboardKpis();
    const vehicleSummary = await getVehicleSummary();
    const driverSummary = await getDriverSummary();
    const tripSummary = await getTripSummary();
    const recentActivities = await getRecentActivities();

    return {
        kpis,
        vehicleSummary,
        driverSummary,
        tripSummary,
        recentActivities,
    };
}
