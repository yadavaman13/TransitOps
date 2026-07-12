import { db } from '../config/database.js';
import { vehicleDocuments } from '../db/schema/vehicle-documents.schema.js';
import { eq, desc } from 'drizzle-orm';

/**
 * Create a vehicle document record
 */
export async function createDocument(data) {
    const [doc] = await db
        .insert(vehicleDocuments)
        .values(data)
        .returning();
    return doc;
}

/**
 * List all documents for a vehicle
 */
export async function listByVehicle(vehicleId) {
    return db
        .select()
        .from(vehicleDocuments)
        .where(eq(vehicleDocuments.vehicleId, vehicleId))
        .orderBy(desc(vehicleDocuments.createdAt));
}

/**
 * Get a document by ID
 */
export async function getById(id) {
    const [doc] = await db
        .select()
        .from(vehicleDocuments)
        .where(eq(vehicleDocuments.id, id));
    return doc || null;
}

/**
 * Update a document's metadata
 */
export async function updateDocument(id, updates) {
    const [doc] = await db
        .update(vehicleDocuments)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(vehicleDocuments.id, id))
        .returning();
    return doc || null;
}

/**
 * Delete a document
 */
export async function deleteDocument(id) {
    const [doc] = await db
        .delete(vehicleDocuments)
        .where(eq(vehicleDocuments.id, id))
        .returning();
    return doc || null;
}
