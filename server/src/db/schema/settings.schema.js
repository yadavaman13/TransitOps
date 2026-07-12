import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';

export const settings = pgTable(
    'settings',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        userId: uuid('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .unique()
            .notNull(),
        notificationPrefs: jsonb('notification_prefs').default({
            tripAssigned: true,
            tripDispatched: true,
            maintenanceDue: true,
            licenseExpiring: true,
            insuranceExpiring: true,
        }).notNull(),
        fleetRules: jsonb('fleet_rules').default({
            maxCargoExceedPercent: 0,
            licenseExpiryWarningDays: 30,
            insuranceExpiryWarningDays: 30,
            maintenanceReminderDays: 7,
        }).notNull(),
        theme: text('theme').default('light').notNull(), // 'light' or 'dark'
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => {
        return {
            userIdIdx: index('settings_user_id_idx').on(table.userId),
        };
    }
);
