import * as notificationDao from '../../../dao/notification.dao.js';

/**
 * List notifications for authenticated user
 */
export async function listNotifications(userId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const items = await notificationDao.listByUser(userId, { limit, offset });
    const unreadCount = await notificationDao.countUnread(userId);
    return { notifications: items, unreadCount };
}

/**
 * Get notification details (with ownership check)
 */
export async function getNotificationById(id, userId) {
    const notification = await notificationDao.getById(id);
    if (!notification) {
        throw Object.assign(new Error('Notification not found'), { statusCode: 404 });
    }
    if (notification.userId !== userId) {
        throw Object.assign(new Error('Access denied'), { statusCode: 403 });
    }
    return notification;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(id, userId) {
    await getNotificationById(id, userId); // ownership check
    return notificationDao.markRead(id);
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId) {
    const count = await notificationDao.markAllRead(userId);
    return { markedCount: count };
}

/**
 * Delete a notification
 */
export async function deleteNotification(id, userId) {
    await getNotificationById(id, userId); // ownership check
    return notificationDao.deleteNotification(id);
}

/**
 * Send license expiry reminders
 * Finds drivers with licenses expiring within 30 days and creates notifications
 */
export async function sendLicenseReminders() {
    const expiringDrivers = await notificationDao.getDriversWithExpiringLicenses(30);
    const created = [];

    for (const driver of expiringDrivers) {
        const daysLeft = Math.ceil(
            (new Date(driver.licenseExpiry) - new Date()) / (1000 * 60 * 60 * 24)
        );
        const title = daysLeft <= 0 ? '⚠️ License Expired' : '🔔 License Expiring Soon';
        const message = daysLeft <= 0
            ? `License ${driver.licenseNumber} for ${driver.userName} has expired.`
            : `License ${driver.licenseNumber} for ${driver.userName} expires in ${daysLeft} day(s).`;

        const notification = await notificationDao.createNotification({
            userId: driver.userId,
            title,
            message,
        });
        created.push(notification);
    }

    return { remindersCreated: created.length, drivers: expiringDrivers.length };
}

/**
 * Send maintenance reminders
 * Finds vehicles with maintenance due within 7 days and creates notifications for Fleet Manager
 */
export async function sendMaintenanceReminders(fleetManagerId) {
    const dueVehicles = await notificationDao.getVehiclesDueForMaintenance(7);
    const created = [];

    for (const item of dueVehicles) {
        const daysLeft = Math.ceil(
            (new Date(item.scheduledDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        const title = daysLeft <= 0 ? '⚠️ Maintenance Overdue' : '🔧 Maintenance Due Soon';
        const message = daysLeft <= 0
            ? `Maintenance "${item.title}" for vehicle ${item.registrationNumber} is overdue.`
            : `Maintenance "${item.title}" for vehicle ${item.registrationNumber} is due in ${daysLeft} day(s).`;

        const notification = await notificationDao.createNotification({
            userId: fleetManagerId,
            title,
            message,
        });
        created.push(notification);
    }

    return { remindersCreated: created.length, vehicles: dueVehicles.length };
}
