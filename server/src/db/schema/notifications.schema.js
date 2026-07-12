import { pgTable, uuid, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';

export const notifications = pgTable(
    'notifications',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        userId: uuid('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        title: text('title').notNull(),
        message: text('message').notNull(),
        isRead: boolean('is_read').default(false).notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => {
        return {
            userIdIdx: index('notifications_user_id_idx').on(table.userId),
        };
    }
);
