import { db } from '../config/database.js';
import { fuelLogs } from '../db/schema/fuel-logs.schema.js';
import { vehicles } from '../db/schema/vehicles.schema.js';
import { eq, and, sql } from 'drizzle-orm';

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

export async function listFuelLogs(filters = {}) {
    const query = db.select().from(fuelLogs);
    const conditions = [];
    if (filters.vehicleId) conditions.push(eq(fuelLogs.vehicleId, filters.vehicleId));
    if (filters.tripId) conditions.push(eq(fuelLogs.tripId, filters.tripId));
    if (filters.driverId) conditions.push(eq(fuelLogs.driverId, filters.driverId));
    
    if (conditions.length > 0) {
        return query.where(and(...conditions));
    }
    return query;
}

export async function getFuelLogById(id) {
    const [log] = await db.select().from(fuelLogs).where(eq(fuelLogs.id, id));
    return log || null;
}

export async function updateFuelLog(id, updates) {
    const [log] = await db
        .update(fuelLogs)
        .set({ ...updates })
        .where(eq(fuelLogs.id, id))
        .returning();
    return log || null;
}

export async function deleteFuelLog(id) {
    const [log] = await db
        .delete(fuelLogs)
        .where(eq(fuelLogs.id, id))
        .returning();
    return log || null;
}

export async function getFuelSummaryMetrics() {
    const [result] = await db
        .select({
            totalCost: sql`sum(${fuelLogs.totalCost})`,
            totalLitres: sql`sum(${fuelLogs.litres})`,
            totalLogs: sql`count(*)`
        })
        .from(fuelLogs);
    const totalCost = result?.totalCost ? Number(result.totalCost) : 0;
    const totalLitres = result?.totalLitres ? Number(result.totalLitres) : 0;
    const totalLogs = result?.totalLogs ? Number(result.totalLogs) : 0;
    const averagePricePerLitre = totalLitres > 0 ? Number((totalCost / totalLitres).toFixed(2)) : 0;
    return {
        totalFuelCost: totalCost,
        totalLitres,
        totalLogs,
        averagePricePerLitre
    };
}

export async function getFuelSummaryByVehicle() {
    return db
        .select({
            vehicleId: fuelLogs.vehicleId,
            registrationNumber: vehicles.registrationNumber,
            brand: vehicles.brand,
            model: vehicles.model,
            totalCost: sql`sum(${fuelLogs.totalCost})`,
            totalLitres: sql`sum(${fuelLogs.litres})`
        })
        .from(fuelLogs)
        .innerJoin(vehicles, eq(fuelLogs.vehicleId, vehicles.id))
        .groupBy(fuelLogs.vehicleId, vehicles.registrationNumber, vehicles.brand, vehicles.model);
}
