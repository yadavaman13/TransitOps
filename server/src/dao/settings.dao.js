import { db } from '../config/database.js';
import { settings } from '../db/schema/settings.schema.js';
import { eq } from 'drizzle-orm';

/**
 * Get settings by user ID
 */
export async function getByUserId(userId) {
    const [row] = await db
        .select()
        .from(settings)
        .where(eq(settings.userId, userId));
    return row || null;
}

/**
 * Create default settings for a user
 */
export async function createDefault(userId) {
    const [row] = await db
        .insert(settings)
        .values({ userId })
        .returning();
    return row;
}

/**
 * Get or create settings (upsert pattern)
 */
export async function getOrCreate(userId) {
    let row = await getByUserId(userId);
    if (!row) {
        row = await createDefault(userId);
    }
    return row;
}

/**
 * Update settings fields
 */
export async function updateSettings(userId, updates) {
    const [row] = await db
        .update(settings)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(settings.userId, userId))
        .returning();
    return row || null;
}

/**
 * Update notification preferences (JSONB)
 */
export async function updateNotificationPrefs(userId, prefs) {
    return updateSettings(userId, { notificationPrefs: prefs });
}

/**
 * Update fleet rules (JSONB)
 */
export async function updateFleetRules(userId, rules) {
    return updateSettings(userId, { fleetRules: rules });
}

/**
 * Update theme
 */
export async function updateTheme(userId, theme) {
    return updateSettings(userId, { theme });
}
