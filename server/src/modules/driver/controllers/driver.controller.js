import * as driverService from '../services/driver.service.js';

export async function registerDriver(req, res, next) {
    try {
        const data = await driverService.registerDriver(req.body);
        return res.status(201).json({
            success: true,
            message: 'Driver registered successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getDrivers(req, res, next) {
    try {
        const data = await driverService.getDrivers();
        return res.status(200).json({
            success: true,
            message: 'Drivers retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getDriverDetails(req, res, next) {
    try {
        const data = await driverService.getDriverDetails(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Driver details retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateDriver(req, res, next) {
    try {
        const data = await driverService.updateDriver(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: 'Driver updated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteDriver(req, res, next) {
    try {
        await driverService.deleteDriver(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Driver deleted successfully',
            data: null,
        });
    } catch (error) {
        next(error);
    }
}

export async function getAvailableDrivers(req, res, next) {
    try {
        const data = await driverService.getAvailableDrivers();
        return res.status(200).json({
            success: true,
            message: 'Available drivers retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateStatus(req, res, next) {
    try {
        const { status } = req.body;
        const data = await driverService.updateDriverStatus(req.params.id, status);
        return res.status(200).json({
            success: true,
            message: 'Driver status updated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateLicense(req, res, next) {
    try {
        const { licenseNumber, licenseExpiry } = req.body;
        const data = await driverService.updateDriverLicense(req.params.id, licenseNumber, licenseExpiry);
        return res.status(200).json({
            success: true,
            message: 'Driver license updated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateSafetyScore(req, res, next) {
    try {
        const { safetyScore } = req.body;
        const data = await driverService.updateDriverSafetyScore(req.params.id, safetyScore);
        return res.status(200).json({
            success: true,
            message: 'Driver safety score updated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function suspendDriver(req, res, next) {
    try {
        const data = await driverService.suspendDriver(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Driver suspended successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function activateDriver(req, res, next) {
    try {
        const data = await driverService.activateDriver(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Driver activated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getDriverTrips(req, res, next) {
    try {
        const data = await driverService.getDriverTrips(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Driver trips retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getExpiringLicenses(req, res, next) {
    try {
        const data = await driverService.getExpiringLicenses();
        return res.status(200).json({
            success: true,
            message: 'Drivers with expiring licenses retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}
