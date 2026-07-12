import * as vehicleService from '../services/vehicle.service.js';

export async function registerVehicle(req, res, next) {
    try {
        const data = await vehicleService.registerVehicle(req.body);
        return res.status(201).json({
            success: true,
            message: 'Vehicle registered successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getVehicles(req, res, next) {
    try {
        const status = req.query.status;
        const data = await vehicleService.getVehicles(status);
        return res.status(200).json({
            success: true,
            message: 'Vehicles retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getVehicleDetails(req, res, next) {
    try {
        const data = await vehicleService.getVehicleDetails(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Vehicle details retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateVehicle(req, res, next) {
    try {
        const data = await vehicleService.updateVehicle(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: 'Vehicle updated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteVehicle(req, res, next) {
    try {
        await vehicleService.deleteVehicle(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully',
            data: null,
        });
    } catch (error) {
        next(error);
    }
}

export async function getAvailableVehicles(req, res, next) {
    try {
        const data = await vehicleService.getAvailableVehicles();
        return res.status(200).json({
            success: true,
            message: 'Available vehicles retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateStatus(req, res, next) {
    try {
        const { status } = req.body;
        const data = await vehicleService.updateVehicleStatus(req.params.id, status);
        return res.status(200).json({
            success: true,
            message: 'Vehicle status updated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function retireVehicle(req, res, next) {
    try {
        const data = await vehicleService.retireVehicle(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Vehicle retired successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function restoreVehicle(req, res, next) {
    try {
        const data = await vehicleService.restoreVehicle(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Vehicle restored successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateOdometer(req, res, next) {
    try {
        const { odometer } = req.body;
        const data = await vehicleService.updateVehicleOdometer(req.params.id, odometer);
        return res.status(200).json({
            success: true,
            message: 'Vehicle odometer updated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getVehicleTrips(req, res, next) {
    try {
        const data = await vehicleService.getVehicleTrips(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Vehicle trips retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getVehicleMaintenance(req, res, next) {
    try {
        const data = await vehicleService.getVehicleMaintenance(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Vehicle maintenance logs retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getVehicleFuelLogs(req, res, next) {
    try {
        const data = await vehicleService.getVehicleFuelLogs(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Vehicle fuel logs retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getVehicleExpenses(req, res, next) {
    try {
        const data = await vehicleService.getVehicleExpenses(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Vehicle expenses retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}
