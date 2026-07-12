import * as vehicleDocumentDao from '../../../dao/vehicleDocument.dao.js';

/**
 * Upload (create) a vehicle document record
 */
export async function uploadDocument({ vehicleId, documentType, fileName, filePath, fileSize, expiryDate, uploadedBy }) {
    return vehicleDocumentDao.createDocument({
        vehicleId,
        documentType,
        fileName,
        filePath,
        fileSize: fileSize || null,
        expiryDate: expiryDate || null,
        uploadedBy,
    });
}

/**
 * List all documents for a vehicle
 */
export async function listDocuments(vehicleId) {
    return vehicleDocumentDao.listByVehicle(vehicleId);
}

/**
 * Get document by ID
 */
export async function getDocumentById(id) {
    const doc = await vehicleDocumentDao.getById(id);
    if (!doc) {
        throw Object.assign(new Error('Document not found'), { statusCode: 404 });
    }
    return doc;
}

/**
 * Update document metadata
 */
export async function updateDocument(id, updates) {
    // Only allow updating specific fields
    const allowed = {};
    if (updates.documentType) allowed.documentType = updates.documentType;
    if (updates.fileName) allowed.fileName = updates.fileName;
    if (updates.filePath) allowed.filePath = updates.filePath;
    if (updates.fileSize !== undefined) allowed.fileSize = updates.fileSize;
    if (updates.expiryDate !== undefined) allowed.expiryDate = updates.expiryDate;

    const doc = await vehicleDocumentDao.updateDocument(id, allowed);
    if (!doc) {
        throw Object.assign(new Error('Document not found'), { statusCode: 404 });
    }
    return doc;
}

/**
 * Delete a document
 */
export async function deleteDocument(id) {
    const doc = await vehicleDocumentDao.deleteDocument(id);
    if (!doc) {
        throw Object.assign(new Error('Document not found'), { statusCode: 404 });
    }
    return doc;
}

/**
 * Get document for download (returns file path)
 */
export async function getDocumentForDownload(id) {
    const doc = await vehicleDocumentDao.getById(id);
    if (!doc) {
        throw Object.assign(new Error('Document not found'), { statusCode: 404 });
    }
    return { filePath: doc.filePath, fileName: doc.fileName };
}
