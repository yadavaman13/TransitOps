import { body, param, validationResult } from 'express-validator';
import { sendResponse } from '../../../utils/response.utlis.js';

function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendResponse({
            res,
            statusCode: 400,
            message: 'Validation failed',
            success: false,
            errors: errors.array(),
        });
    }
    next();
}

export const uploadValidator = [
    body('vehicleId')
        .isUUID()
        .withMessage('Valid vehicle ID is required'),
    body('documentType')
        .trim()
        .notEmpty()
        .withMessage('Document type is required')
        .isIn(['RC', 'Insurance', 'PUC', 'Permit', 'Fitness', 'Other'])
        .withMessage('Invalid document type'),
    body('fileName')
        .trim()
        .notEmpty()
        .withMessage('File name is required'),
    body('filePath')
        .trim()
        .notEmpty()
        .withMessage('File path is required'),
    validateRequest,
];

export const documentIdValidator = [
    param('id')
        .isUUID()
        .withMessage('Invalid document ID'),
    validateRequest,
];

export const vehicleIdValidator = [
    param('vehicleId')
        .isUUID()
        .withMessage('Invalid vehicle ID'),
    validateRequest,
];
