import { pgTable, uuid, text, timestamp, numeric, index, check } from 'drizzle-orm/pg-core';
import { trips } from './trips.schema.js';
import { vehicles } from './vehicles.schema.js';
import { users } from './users.schema.js';
import { sql } from 'drizzle-orm';

export const fuelLogs = pgTable(
    'fuel_logs',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        tripId: uuid('trip_id')
            .references(() => trips.id, { onDelete: 'cascade' })
            .notNull(),
        vehicleId: uuid('vehicle_id')
            .references(() => vehicles.id, { onDelete: 'cascade' })
            .notNull(),
        driverId: uuid('driver_id')
            .references(() => users.id, { onDelete: 'restrict' })
            .notNull(),
        litres: numeric('litres', { precision: 10, scale: 2 }).notNull(),
        pricePerLitre: numeric('price_per_litre', { precision: 10, scale: 2 }).notNull(),
        totalCost: numeric('total_cost', { precision: 12, scale: 2 }).notNull(),
        stationName: text('station_name').notNull(),
        odometer: numeric('odometer', { precision: 10, scale: 2 }).notNull(),
        receiptUrl: text('receipt_url'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => {
        return {
            tripIdIdx: index('fuel_logs_trip_id_idx').on(table.tripId),
            vehicleIdIdx: index('fuel_logs_vehicle_id_idx').on(table.vehicleId),
            driverIdIdx: index('fuel_logs_driver_id_idx').on(table.driverId),
            
            // Database-level validations
            litresCheck: check('litres_check', sql`${table.litres} > 0.00`),
            priceCheck: check('price_check', sql`${table.pricePerLitre} > 0.00`),
            totalCostCheck: check('total_cost_check', sql`${table.totalCost} >= 0.00`),
            fuelOdometerCheck: check('fuel_odometer_check', sql`${table.odometer} >= 0.00`),
        };
    }
);
