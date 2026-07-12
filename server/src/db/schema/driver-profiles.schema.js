import { pgTable, uuid, text, timestamp, numeric, integer, index, check } from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';
import { sql } from 'drizzle-orm';

export const driverProfiles = pgTable(
    'driver_profiles',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        userId: uuid('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        licenseNumber: text('license_number').unique().notNull(),
        licenseExpiry: timestamp('license_expiry', { withTimezone: true }).notNull(),
        joiningDate: timestamp('joining_date', { withTimezone: true }).notNull(),
        phone: text('phone').notNull(), // Stored under driver profile as requested
        emergencyContact: text('emergency_contact').notNull(),
        bloodGroup: text('blood_group'),
        safetyScore: numeric('safety_score', { precision: 5, scale: 2 }).default('100.00').notNull(),
        experienceYears: integer('experience_years'),
        availabilityStatus: text('availability_status').default('AVAILABLE').notNull(), // 'AVAILABLE', 'ON_TRIP', 'ON_LEAVE'
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => {
        return {
            userIdIdx: index('driver_profiles_user_id_idx').on(table.userId),
            licenseNumberIdx: index('driver_profiles_license_num_idx').on(table.licenseNumber),
            availabilityIdx: index('driver_profiles_availability_idx').on(table.availabilityStatus),
            
            // Database-level validations
            phoneLengthCheck: check('phone_length_check', sql`char_length(${table.phone}) <= 10`),
            phoneDigitsCheck: check('phone_digits_check', sql`${table.phone} ~ '^[0-9]+$'`),
            licenseNumberLenCheck: check('license_num_len_check', sql`char_length(${table.licenseNumber}) >= 5`),
            safetyScoreRange: check('safety_score_range', sql`${table.safetyScore} >= 0.00 AND ${table.safetyScore} <= 100.00`),
            experienceYearsCheck: check('experience_years_check', sql`${table.experienceYears} >= 0`),
        };
    }
);
