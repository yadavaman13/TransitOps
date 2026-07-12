import { db } from '../config/database.js';
import { vehicles } from '../db/schema/vehicles.schema.js';
import { eq } from 'drizzle-orm';

export async function createVehicle(data) {
    const [vehicle] = await db.insert(vehicles).values(data).returning();
    return vehicle;
}

export async function getVehicleById(id) {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || null;
}

export async function getVehicleByRegistration(registrationNumber) {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.registrationNumber, registrationNumber));
    return vehicle || null;
}

export async function listVehicles(status) {
    if (status) {
        return db.select().from(vehicles).where(eq(vehicles.status, status));
    }
    return db.select().from(vehicles);
}

export async function getAvailableVehicles() {
    return db.select().from(vehicles).where(eq(vehicles.status, 'AVAILABLE'));
}

export async function updateVehicle(id, updates) {
    const [vehicle] = await db
        .update(vehicles)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(vehicles.id, id))
        .returning();
    return vehicle || null;
}

export async function deleteVehicle(id) {
    const [vehicle] = await db
        .delete(vehicles)
        .where(eq(vehicles.id, id))
        .returning();
    return vehicle || null;
}
