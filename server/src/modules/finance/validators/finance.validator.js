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

export const createExpenseValidator = [
    body('vehicleId').isUUID().withMessage('Vehicle ID must be a valid UUID'),
    body('category')
        .isIn(['Fuel', 'Toll', 'Parking', 'Repair', 'Insurance', 'Misc'])
        .withMessage('Invalid expense category'),
    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Expense amount must be a positive number'),
    body('description').optional().isString().trim(),
    body('receipt').optional().isString().trim(),
    body('tripId').optional().custom((val) => {
        if (val && !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val)) {
            throw new Error('Trip ID must be a valid UUID');
        }
        return true;
    }),
    validateRequest
];
