import {
    pgTable,
    uuid,
    text,
    boolean,
    timestamp,
    index,
    check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable(
    'users',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        name: text('name').notNull(),
        email: text('email').unique().notNull(),
        password: text('password').notNull(),
        role: text('role').notNull(),
        emailVerified: boolean('email_verified').default(false).notNull(),
        isActive: boolean('is_active').default(true).notNull(),
        isDeleted: boolean('is_deleted').default(false).notNull(),
        deletedAt: timestamp('deleted_at', { withTimezone: true }),
        phone: text('phone'),
        profileImage: text('profile_image').default('https://ik.imagekit.io/2bzzjhgkg/defaul_profile_image.jpeg'),
        status: text('status').default('ACTIVE').notNull(), // Added status field
        createdAt: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => {
        return {
            emailIdx: index('users_email_idx').on(table.email),
            roleIdx: index('users_role_idx').on(table.role),
            isDeletedIdx: index('users_is_deleted_idx').on(table.isDeleted),
            
            // Database-level validations
            emailFormatCheck: check('user_email_format_check', sql`${table.email} ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$'`),
            phoneLengthCheck: check('user_phone_length_check', sql`${table.phone} IS NULL OR char_length(${table.phone}) <= 10`),
            phoneDigitsCheck: check('user_phone_digits_check', sql`${table.phone} IS NULL OR ${table.phone} ~ '^[0-9]+$'`),
            
            // Role and Status constraints based on the provided specifications
            roleCheck: check('user_role_check', sql`${table.role} IN ('FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST')`),
            statusCheck: check('user_status_check', sql`${table.status} IN ('ACTIVE', 'INACTIVE')`),
        };
    },
);
