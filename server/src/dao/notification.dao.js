import { db } from '../config/database.js';
import { notifications } from '../db/schema/notifications.schema.js';
import { driverProfiles } from '../db/schema/driver-profiles.schema.js';
import { maintenance } from '../db/schema/maintenance.schema.js';
import { vehicles } from '../db/schema/vehicles.schema.js';
import { users } from '../db/schema/users.schema.js';
import { eq, and, desc, sql, lte } from 'drizzle-orm';

/**
 * List notifications for a user (paginated, newest first)
 */
export async function listByUser(userId, { limit = 20, offset = 0 } = {}) {
    return db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);
}

/**
 * Count unread notifications for a user
 */
export async function countUnread(userId) {
    const [result] = await db
        .select({ count: sql`count(*)::int` })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result?.count ?? 0;
}

/**
 * Get notification by ID
 */
export async function getById(id) {
    const [notification] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, id));
    return notification || null;
}

/**
 * Create a notification
 */
export async function createNotification({ userId, title, message }) {
    const [notification] = await db
        .insert(notifications)
        .values({ userId, title, message })
        .returning();
    return notification;
}

/**
 * Mark a single notification as read
 */
export async function markRead(id) {
    const [notification] = await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id))
        .returning();
    return notification || null;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllRead(userId) {
    const result = await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
        .returning();
    return result.length;
}

/**
 * Delete a notification
 */
export async function deleteNotification(id) {
    const [notification] = await db
        .delete(notifications)
        .where(eq(notifications.id, id))
        .returning();
    return notification || null;
}

/**
 * Get drivers whose licenses expire within the given number of days
 */
export async function getDriversWithExpiringLicenses(withinDays = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + withinDays);

    return db
        .select({
            driverProfileId: driverProfiles.id,
            userId: driverProfiles.userId,
            licenseNumber: driverProfiles.licenseNumber,
            licenseExpiry: driverProfiles.licenseExpiry,
            userName: users.name,
            userEmail: users.email,
        })
        .from(driverProfiles)
        .innerJoin(users, eq(driverProfiles.userId, users.id))
        .where(
            and(
                lte(driverProfiles.licenseExpiry, cutoffDate),
                eq(users.isDeleted, false)
            )
        );
}

/**
 * Get vehicles with upcoming or overdue maintenance
 */
export async function getVehiclesDueForMaintenance(withinDays = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + withinDays);

    return db
        .select({
            maintenanceId: maintenance.id,
            vehicleId: maintenance.vehicleId,
            title: maintenance.title,
            scheduledDate: maintenance.scheduledDate,
            registrationNumber: vehicles.registrationNumber,
        })
        .from(maintenance)
        .innerJoin(vehicles, eq(maintenance.vehicleId, vehicles.id))
        .where(
            and(
                lte(maintenance.scheduledDate, cutoffDate),
                eq(maintenance.status, 'PENDING')
            )
        );
}
