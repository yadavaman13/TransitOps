import * as settingsService from '../services/settings.service.js';
import { sendResponse } from '../../../utils/response.utlis.js';

/**
 * GET /api/settings
 * Get current user's settings
 */
export async function get(req, res, next) {
    try {
        const settings = await settingsService.getSettings(req.user.id);

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Settings retrieved successfully',
            success: true,
            data: { settings },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH /api/settings
 * Update all settings
 */
export async function update(req, res, next) {
    try {
        const settings = await settingsService.updateSettings(req.user.id, req.body);

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Settings updated successfully',
            success: true,
            data: { settings },
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
 * PATCH /api/settings/notifications
 * Update notification preferences
 */
export async function updateNotifications(req, res, next) {
    try {
        const settings = await settingsService.updateNotificationPrefs(req.user.id, req.body);

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Notification settings updated successfully',
            success: true,
            data: { settings },
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
 * PATCH /api/settings/fleet-rules
 * Update fleet rules (Fleet Manager / Admin only)
 */
export async function updateFleetRules(req, res, next) {
    try {
        const settings = await settingsService.updateFleetRules(req.user.id, req.body);

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Fleet rules updated successfully',
            success: true,
            data: { settings },
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
 * PATCH /api/settings/theme
 * Update theme preference
 */
export async function updateTheme(req, res, next) {
    try {
        const { theme } = req.body;
        const settings = await settingsService.updateTheme(req.user.id, theme);

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Theme updated successfully',
            success: true,
            data: { settings },
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
