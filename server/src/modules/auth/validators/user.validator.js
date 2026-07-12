import { body, validationResult } from 'express-validator';
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

export const updateProfileValidator = [
    body('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Name cannot be empty'),
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('A valid email is required'),
    validateRequest,
];

export const adminUpdateRoleValidator = [
    body('role')
        .trim()
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['USER', 'ADMIN'])
        .withMessage('Role must be either USER or ADMIN'),
    validateRequest,
];
