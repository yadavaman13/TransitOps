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

export const themeValidator = [
    body('theme')
        .trim()
        .notEmpty()
        .withMessage('Theme is required')
        .isIn(['light', 'dark'])
        .withMessage('Theme must be "light" or "dark"'),
    validateRequest,
];

export const notificationPrefsValidator = [
    body('tripAssigned').optional().isBoolean().withMessage('tripAssigned must be a boolean'),
    body('tripDispatched').optional().isBoolean().withMessage('tripDispatched must be a boolean'),
    body('maintenanceDue').optional().isBoolean().withMessage('maintenanceDue must be a boolean'),
    body('licenseExpiring').optional().isBoolean().withMessage('licenseExpiring must be a boolean'),
    body('insuranceExpiring').optional().isBoolean().withMessage('insuranceExpiring must be a boolean'),
    validateRequest,
];

export const fleetRulesValidator = [
    body('maxCargoExceedPercent').optional().isNumeric().withMessage('maxCargoExceedPercent must be a number'),
    body('licenseExpiryWarningDays').optional().isInt({ min: 1 }).withMessage('licenseExpiryWarningDays must be a positive integer'),
    body('insuranceExpiryWarningDays').optional().isInt({ min: 1 }).withMessage('insuranceExpiryWarningDays must be a positive integer'),
    body('maintenanceReminderDays').optional().isInt({ min: 1 }).withMessage('maintenanceReminderDays must be a positive integer'),
    validateRequest,
];
