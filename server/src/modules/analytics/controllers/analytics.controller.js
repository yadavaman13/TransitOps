import * as analyticsService from '../services/analytics.service.js';

export async function getFleetUtilization(req, res, next) {
    try {
        const data = await analyticsService.getFleetUtilization();
        return res.status(200).json({
            success: true,
            message: 'Fleet utilization metrics generated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getFuelEfficiency(req, res, next) {
    try {
        const data = await analyticsService.getFuelEfficiency();
        return res.status(200).json({
            success: true,
            message: 'Fuel efficiency analytics generated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getVehicleROI(req, res, next) {
    try {
        const data = await analyticsService.getVehicleROI();
        return res.status(200).json({
            success: true,
            message: 'Vehicle ROI analysis generated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getDriverPerformance(req, res, next) {
    try {
        const data = await analyticsService.getDriverPerformance();
        return res.status(200).json({
            success: true,
            message: 'Driver performance analytics generated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getMaintenanceTrends(req, res, next) {
    try {
        const data = await analyticsService.getMaintenanceTrends();
        return res.status(200).json({
            success: true,
            message: 'Maintenance trends analytics generated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getExpenseTrends(req, res, next) {
    try {
        const data = await analyticsService.getExpenseTrends();
        return res.status(200).json({
            success: true,
            message: 'Expense trends analytics generated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getMonthlyStatistics(req, res, next) {
    try {
        const data = await analyticsService.getMonthlyStatistics();
        return res.status(200).json({
            success: true,
            message: 'Monthly statistics report generated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}
