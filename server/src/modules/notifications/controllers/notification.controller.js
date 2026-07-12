import * as notificationService from '../services/notification.service.js';
import { sendResponse } from '../../../utils/response.utlis.js';

/**
 * GET /api/notifications
 * List notifications for the authenticated user
 */
export async function list(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await notificationService.listNotifications(req.user.id, { page, limit });

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Notifications retrieved successfully',
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/notifications/:id
 * Get notification details
 */
export async function details(req, res, next) {
    try {
        const notification = await notificationService.getNotificationById(req.params.id, req.user.id);

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Notification retrieved successfully',
            success: true,
            data: { notification },
        });
    } catch (error) {
        if (error.statusCode) {
            return sendResponse({
                res,
                statusCode: error.statusCode,
                message: error.message,
                success: false,
            });
        }
        next(error);
    }
}

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
export async function markRead(req, res, next) {
    try {
        const notification = await notificationService.markAsRead(req.params.id, req.user.id);

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Notification marked as read',
            success: true,
            data: { notification },
        });
    } catch (error) {
        if (error.statusCode) {
            return sendResponse({
                res,
                statusCode: error.statusCode,
                message: error.message,
                success: false,
            });
        }
        next(error);
    }
}

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
export async function readAll(req, res, next) {
    try {
        const result = await notificationService.markAllAsRead(req.user.id);

        return sendResponse({
            res,
            statusCode: 200,
            message: `${result.markedCount} notification(s) marked as read`,
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
export async function deleteNotification(req, res, next) {
    try {
        await notificationService.deleteNotification(req.params.id, req.user.id);

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Notification deleted successfully',
            success: true,
        });
    } catch (error) {
        if (error.statusCode) {
            return sendResponse({
                res,
                statusCode: error.statusCode,
                message: error.message,
                success: false,
            });
        }
        next(error);
    }
}

/**
 * POST /api/notifications/license-reminder
 * Send license expiry reminders (Fleet Manager / Admin only)
 */
export async function licenseReminder(req, res, next) {
    try {
        const result = await notificationService.sendLicenseReminders();

        return sendResponse({
            res,
            statusCode: 200,
            message: `License reminders sent for ${result.drivers} driver(s)`,
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/notifications/maintenance-reminder
 * Send maintenance reminders (Fleet Manager / Admin only)
 */
export async function maintenanceReminder(req, res, next) {
    try {
        const result = await notificationService.sendMaintenanceReminders(req.user.id);

        return sendResponse({
            res,
            statusCode: 200,
            message: `Maintenance reminders sent for ${result.vehicles} vehicle(s)`,
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}
