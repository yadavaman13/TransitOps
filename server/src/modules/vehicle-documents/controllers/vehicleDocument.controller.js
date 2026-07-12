import * as vehicleDocumentService from '../services/vehicleDocument.service.js';
import { sendResponse } from '../../../utils/response.utlis.js';

/**
 * POST /api/vehicle-documents
 * Upload a vehicle document
 */
export async function upload(req, res, next) {
    try {
        const { vehicleId, documentType, fileName, filePath, fileSize, expiryDate } = req.body;

        const doc = await vehicleDocumentService.uploadDocument({
            vehicleId,
            documentType,
            fileName,
            filePath,
            fileSize,
            expiryDate,
            uploadedBy: req.user.id,
        });

        return sendResponse({
            res,
            statusCode: 201,
            message: 'Document uploaded successfully',
            success: true,
            data: { document: doc },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/vehicle-documents/:vehicleId
 * List documents for a vehicle
 */
export async function list(req, res, next) {
    try {
        const documents = await vehicleDocumentService.listDocuments(req.params.vehicleId);

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Documents retrieved successfully',
            success: true,
            data: { documents },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH /api/vehicle-documents/:id
 * Update document metadata
 */
export async function update(req, res, next) {
    try {
        const doc = await vehicleDocumentService.updateDocument(req.params.id, req.body);

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Document updated successfully',
            success: true,
            data: { document: doc },
        });
    } catch (error) {
        if (error.statusCode) {
            return sendResponse({
                res,
                statusCode: error.statusCode,
                message: error.message,
                success: false,
            });
        }
        next(error);
    }
}

/**
 * DELETE /api/vehicle-documents/:id
 * Delete a document
 */
export async function deleteDocument(req, res, next) {
    try {
        await vehicleDocumentService.deleteDocument(req.params.id);

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Document deleted successfully',
            success: true,
        });
    } catch (error) {
        if (error.statusCode) {
            return sendResponse({
                res,
                statusCode: error.statusCode,
                message: error.message,
                success: false,
            });
        }
        next(error);
    }
}

/**
 * GET /api/vehicle-documents/:id/download
 * Get document download URL
 */
export async function download(req, res, next) {
    try {
        const { filePath, fileName } = await vehicleDocumentService.getDocumentForDownload(req.params.id);

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Document download ready',
            success: true,
            data: { filePath, fileName },
        });
    } catch (error) {
        if (error.statusCode) {
            return sendResponse({
                res,
                statusCode: error.statusCode,
                message: error.message,
                success: false,
            });
        }
        next(error);
    }
}
