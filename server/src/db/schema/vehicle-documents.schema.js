import { pgTable, uuid, text, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { vehicles } from './vehicles.schema.js';
import { users } from './users.schema.js';

export const vehicleDocuments = pgTable(
    'vehicle_documents',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        vehicleId: uuid('vehicle_id')
            .references(() => vehicles.id, { onDelete: 'cascade' })
            .notNull(),
        documentType: text('document_type').notNull(), // 'RC', 'Insurance', 'PUC', 'Permit', 'Fitness', 'Other'
        fileName: text('file_name').notNull(),
        filePath: text('file_path').notNull(),
        fileSize: integer('file_size'), // bytes
        expiryDate: timestamp('expiry_date', { withTimezone: true }),
        uploadedBy: uuid('uploaded_by')
            .references(() => users.id, { onDelete: 'restrict' })
            .notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => {
        return {
            vehicleIdIdx: index('vehicle_documents_vehicle_id_idx').on(table.vehicleId),
            documentTypeIdx: index('vehicle_documents_doc_type_idx').on(table.documentType),
            uploadedByIdx: index('vehicle_documents_uploaded_by_idx').on(table.uploadedBy),
        };
    }
);
