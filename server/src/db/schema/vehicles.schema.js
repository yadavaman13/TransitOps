import { pgTable, uuid, text, timestamp, numeric, integer, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const vehicles = pgTable(
    'vehicles',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        registrationNumber: text('registration_number').unique().notNull(),
        vehicleNumber: text('vehicle_number').notNull(),
        brand: text('brand').notNull(),
        model: text('model').notNull(),
        manufactureYear: integer('manufacture_year').notNull(),
        capacityKg: numeric('capacity_kg', { precision: 10, scale: 2 }).notNull(),
        fuelType: text('fuel_type').notNull(), // 'Diesel', 'Petrol', 'CNG', 'EV'
        currentOdometer: numeric('current_odometer', { precision: 10, scale: 2 }).default('0.00').notNull(),
        status: text('status').default('AVAILABLE').notNull(), // 'AVAILABLE', 'ON_TRIP', 'MAINTENANCE', 'RETIRED'
        purchaseDate: timestamp('purchase_date', { withTimezone: true }).notNull(),
        insuranceExpiry: timestamp('insurance_expiry', { withTimezone: true }).notNull(),
        pollutionExpiry: timestamp('pollution_expiry', { withTimezone: true }).notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => {
        return {
            registrationNumberIdx: index('vehicles_reg_number_idx').on(table.registrationNumber),
            statusIdx: index('vehicles_status_idx').on(table.status),
            
            // Database-level validations
            manufactureYearCheck: check('manufacture_year_check', sql`${table.manufactureYear} >= 1900 AND ${table.manufactureYear} <= 2100`),
            capacityCheck: check('capacity_check', sql`${table.capacityKg} > 0.00`),
            odometerCheck: check('odometer_check', sql`${table.currentOdometer} >= 0.00`),
        };
    }
);
