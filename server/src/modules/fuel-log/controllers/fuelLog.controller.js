import * as fuelLogService from '../services/fuelLog.service.js';

export async function createFuelLog(req, res, next) {
    try {
        const data = await fuelLogService.createFuelLog(req.body, req.user);
        return res.status(201).json({
            success: true,
            message: 'Fuel log created successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getFuelLogs(req, res, next) {
    try {
        const filters = {
            vehicleId: req.query.vehicleId,
            tripId: req.query.tripId,
            driverId: req.query.driverId,
        };
        const data = await fuelLogService.getFuelLogs(filters, req.user);
        return res.status(200).json({
            success: true,
            message: 'Fuel logs retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getFuelLogDetails(req, res, next) {
    try {
        const data = await fuelLogService.getFuelLogDetails(req.params.id, req.user);
        return res.status(200).json({
            success: true,
            message: 'Fuel log details retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateFuelLog(req, res, next) {
    try {
        const data = await fuelLogService.updateFuelLog(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: 'Fuel log updated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteFuelLog(req, res, next) {
    try {
        await fuelLogService.deleteFuelLog(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Fuel log deleted successfully',
            data: null,
        });
    } catch (error) {
        next(error);
    }
}

export async function getFuelSummary(req, res, next) {
    try {
        const data = await fuelLogService.getFuelSummary();
        return res.status(200).json({
            success: true,
            message: 'Fuel log summary retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getVehicleFuelLogs(req, res, next) {
    try {
        const data = await fuelLogService.getVehicleFuelLogs(req.params.vehicleId);
        return res.status(200).json({
            success: true,
            message: 'Vehicle fuel logs retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}
