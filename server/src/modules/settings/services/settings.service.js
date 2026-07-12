import * as settingsDao from '../../../dao/settings.dao.js';

/**
 * Get settings for the current user (auto-creates if missing)
 */
export async function getSettings(userId) {
    return settingsDao.getOrCreate(userId);
}

/**
 * Update general settings
 */
export async function updateSettings(userId, updates) {
    // Ensure settings row exists first
    await settingsDao.getOrCreate(userId);

    const allowed = {};
    if (updates.notificationPrefs !== undefined) allowed.notificationPrefs = updates.notificationPrefs;
    if (updates.fleetRules !== undefined) allowed.fleetRules = updates.fleetRules;
    if (updates.theme !== undefined) allowed.theme = updates.theme;

    const result = await settingsDao.updateSettings(userId, allowed);
    if (!result) {
        throw Object.assign(new Error('Settings not found'), { statusCode: 404 });
    }
    return result;
}

/**
 * Update notification preferences
 */
export async function updateNotificationPrefs(userId, prefs) {
    await settingsDao.getOrCreate(userId);
    const result = await settingsDao.updateNotificationPrefs(userId, prefs);
    if (!result) {
        throw Object.assign(new Error('Settings not found'), { statusCode: 404 });
    }
    return result;
}

/**
 * Update fleet rules (admin/fleet manager only)
 */
export async function updateFleetRules(userId, rules) {
    await settingsDao.getOrCreate(userId);
    const result = await settingsDao.updateFleetRules(userId, rules);
    if (!result) {
        throw Object.assign(new Error('Settings not found'), { statusCode: 404 });
    }
    return result;
}

/**
 * Update theme preference
 */
export async function updateTheme(userId, theme) {
    await settingsDao.getOrCreate(userId);
    const result = await settingsDao.updateTheme(userId, theme);
    if (!result) {
        throw Object.assign(new Error('Settings not found'), { statusCode: 404 });
    }
    return result;
}
