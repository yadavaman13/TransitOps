import { db } from '../config/database.js';
import { maintenance } from '../db/schema/maintenance.schema.js';
import { eq, and, sql } from 'drizzle-orm';

export async function createMaintenanceRecord(data) {
    const [record] = await db.insert(maintenance).values(data).returning();
    return record;
}

export async function getMaintenanceByVehicle(vehicleId) {
    return db.select().from(maintenance).where(eq(maintenance.vehicleId, vehicleId));
}

export async function getActiveMaintenanceCount() {
    const [result] = await db
        .select({
            count: sql`count(*)`
        })
        .from(maintenance)
        .where(eq(maintenance.status, 'IN_PROGRESS'));
    return result?.count ? Number(result.count) : 0;
}

export async function hasActiveMaintenance(vehicleId) {
    const active = await db
        .select()
        .from(maintenance)
        .where(
            and(
                eq(maintenance.vehicleId, vehicleId),
                eq(maintenance.status, 'IN_PROGRESS')
            )
        )
        .limit(1);
    return active.length > 0;
}
