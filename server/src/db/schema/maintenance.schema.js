import { pgTable, uuid, text, timestamp, numeric, index, check } from 'drizzle-orm/pg-core';
import { vehicles } from './vehicles.schema.js';
import { sql } from 'drizzle-orm';

export const maintenance = pgTable(
    'maintenance',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        vehicleId: uuid('vehicle_id')
            .references(() => vehicles.id, { onDelete: 'cascade' })
            .notNull(),
        title: text('title').notNull(),
        description: text('description'),
        maintenanceType: text('maintenance_type').notNull(), // 'Repair', 'Oil Change', 'Tyres', 'Insurance', 'General Service'
        cost: numeric('cost', { precision: 12, scale: 2 }).notNull(),
        serviceCenter: text('service_center'),
        scheduledDate: timestamp('scheduled_date', { withTimezone: true }).notNull(),
        completedDate: timestamp('completed_date', { withTimezone: true }),
        status: text('status').default('PENDING').notNull(), // 'PENDING', 'IN_PROGRESS', 'COMPLETED'
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => {
        return {
            vehicleIdIdx: index('maintenance_vehicle_id_idx').on(table.vehicleId),
            statusIdx: index('maintenance_status_idx').on(table.status),
            
            // Database-level validations
            maintenanceCostCheck: check('maintenance_cost_check', sql`${table.cost} >= 0.00`),
        };
    }
);
