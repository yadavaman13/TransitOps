import * as maintenanceService from '../services/maintenance.service.js';

export async function createMaintenance(req, res, next) {
    try {
        const data = await maintenanceService.createMaintenance(req.body);
        return res.status(201).json({
            success: true,
            message: 'Maintenance record created successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getMaintenanceRecords(req, res, next) {
    try {
        const filters = {
            status: req.query.status,
            maintenanceType: req.query.maintenanceType,
            vehicleId: req.query.vehicleId,
        };
        const data = await maintenanceService.getMaintenanceRecords(filters);
        return res.status(200).json({
            success: true,
            message: 'Maintenance records retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getMaintenanceDetails(req, res, next) {
    try {
        const data = await maintenanceService.getMaintenanceDetails(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Maintenance record details retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateMaintenance(req, res, next) {
    try {
        const data = await maintenanceService.updateMaintenance(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: 'Maintenance record updated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function closeMaintenance(req, res, next) {
    try {
        const data = await maintenanceService.closeMaintenance(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Maintenance record closed successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function cancelMaintenance(req, res, next) {
    try {
        const data = await maintenanceService.cancelMaintenance(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Maintenance record cancelled successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getActiveMaintenanceRecords(req, res, next) {
    try {
        const data = await maintenanceService.getActiveMaintenance();
        return res.status(200).json({
            success: true,
            message: 'Active maintenance records retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getVehicleMaintenanceHistory(req, res, next) {
    try {
        const data = await maintenanceService.getVehicleMaintenanceHistory(req.params.vehicleId);
        return res.status(200).json({
            success: true,
            message: 'Vehicle maintenance history retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}
