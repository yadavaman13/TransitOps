import { pgTable, uuid, text, timestamp, numeric, index, check } from 'drizzle-orm/pg-core';
import { vehicles } from './vehicles.schema.js';
import { users } from './users.schema.js';
import { sql } from 'drizzle-orm';

export const trips = pgTable(
    'trips',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        tripNumber: text('trip_number').unique().notNull(), // e.g. TRP-1001
        vehicleId: uuid('vehicle_id')
            .references(() => vehicles.id, { onDelete: 'restrict' })
            .notNull(),
        driverId: uuid('driver_id')
            .references(() => users.id, { onDelete: 'restrict' })
            .notNull(),
        createdBy: uuid('created_by')
            .references(() => users.id, { onDelete: 'restrict' })
            .notNull(),
        source: text('source').notNull(),
        destination: text('destination').notNull(),
        cargoName: text('cargo_name').notNull(),
        cargoWeight: numeric('cargo_weight', { precision: 10, scale: 2 }).notNull(),
        distanceKm: numeric('distance_km', { precision: 10, scale: 2 }).notNull(),
        plannedStart: timestamp('planned_start', { withTimezone: true }).notNull(),
        plannedEnd: timestamp('planned_end', { withTimezone: true }).notNull(),
        actualStart: timestamp('actual_start', { withTimezone: true }),
        actualEnd: timestamp('actual_end', { withTimezone: true }),
        status: text('status').default('DRAFT').notNull(), // 'DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'
        remarks: text('remarks'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => {
        return {
            tripNumberIdx: index('trips_number_idx').on(table.tripNumber),
            vehicleIdIdx: index('trips_vehicle_id_idx').on(table.vehicleId),
            driverIdIdx: index('trips_driver_id_idx').on(table.driverId),
            statusIdx: index('trips_status_idx').on(table.status),
            
            // Database-level validations
            cargoWeightCheck: check('cargo_weight_check', sql`${table.cargoWeight} > 0.00`),
            distanceCheck: check('distance_check', sql`${table.distanceKm} > 0.00`),
        };
    }
);
