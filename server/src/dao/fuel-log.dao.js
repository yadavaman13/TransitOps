import { db } from '../config/database.js';
import { fuelLogs } from '../db/schema/fuel-logs.schema.js';
import { eq, sql } from 'drizzle-orm';

export async function createFuelLog(data) {
    const [log] = await db.insert(fuelLogs).values(data).returning();
    return log;
}

export async function getFuelLogsByVehicle(vehicleId) {
    return db.select().from(fuelLogs).where(eq(fuelLogs.vehicleId, vehicleId));
}

export async function getTotalFuelCost() {
    const [result] = await db
        .select({
            total: sql`sum(${fuelLogs.totalCost})`
        })
        .from(fuelLogs);
    return result?.total ? Number(result.total) : 0;
}
