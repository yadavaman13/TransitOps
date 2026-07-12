import { pgTable, uuid, text, timestamp, numeric, index, check } from 'drizzle-orm/pg-core';
import { trips } from './trips.schema.js';
import { vehicles } from './vehicles.schema.js';
import { users } from './users.schema.js';
import { sql } from 'drizzle-orm';

export const expenses = pgTable(
    'expenses',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        tripId: uuid('trip_id')
            .references(() => trips.id, { onDelete: 'set null' }), // Optional trip link
        vehicleId: uuid('vehicle_id')
            .references(() => vehicles.id, { onDelete: 'cascade' })
            .notNull(),
        category: text('category').notNull(), // 'Fuel', 'Toll', 'Parking', 'Repair', 'Insurance', 'Misc'
        amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
        description: text('description'),
        receipt: text('receipt'), // URL or path to receipt file
        createdBy: uuid('created_by')
            .references(() => users.id, { onDelete: 'restrict' })
            .notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => {
        return {
            tripIdIdx: index('expenses_trip_id_idx').on(table.tripId),
            vehicleIdIdx: index('expenses_vehicle_id_idx').on(table.vehicleId),
            categoryIdx: index('expenses_category_idx').on(table.category),
            
            // Database-level validations
            expenseAmountCheck: check('expense_amount_check', sql`${table.amount} > 0.00`),
        };
    }
);
