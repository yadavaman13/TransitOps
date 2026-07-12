import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';

export const auditLogs = pgTable(
    'audit_logs',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
        action: text('action').notNull(),
        entity: text('entity').notNull(), // Target table name (e.g. 'vehicles')
        entityId: uuid('entity_id').notNull(),
        oldValue: jsonb('old_value'),
        newValue: jsonb('new_value'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => {
        return {
            userIdIdx: index('audit_logs_user_id_idx').on(table.userId),
            entityIdx: index('audit_logs_entity_idx').on(table.entity),
            entityIdIdx: index('audit_logs_entity_id_idx').on(table.entityId),
        };
    }
);
