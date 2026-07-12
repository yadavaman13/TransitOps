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

export async function listMaintenance(filters = {}) {
    const query = db.select().from(maintenance);
    const conditions = [];
    if (filters.status) conditions.push(eq(maintenance.status, filters.status));
    if (filters.maintenanceType) conditions.push(eq(maintenance.maintenanceType, filters.maintenanceType));
    if (filters.vehicleId) conditions.push(eq(maintenance.vehicleId, filters.vehicleId));
    
    if (conditions.length > 0) {
        return query.where(and(...conditions));
    }
    return query;
}

export async function getMaintenanceById(id) {
    const [record] = await db.select().from(maintenance).where(eq(maintenance.id, id));
    return record || null;
}

export async function updateMaintenanceRecord(id, updates) {
    const [record] = await db
        .update(maintenance)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(maintenance.id, id))
        .returning();
    return record || null;
}

export async function deleteMaintenanceRecord(id) {
    const [record] = await db
        .delete(maintenance)
        .where(eq(maintenance.id, id))
        .returning();
    return record || null;
}

export async function getActiveMaintenance() {
    return db.select().from(maintenance).where(eq(maintenance.status, 'IN_PROGRESS'));
}

