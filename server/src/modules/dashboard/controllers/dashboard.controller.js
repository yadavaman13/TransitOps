import * as dashboardService from '../services/dashboard.service.js';

export async function getDashboardOverview(req, res, next) {
    try {
        const data = await dashboardService.getDashboardOverview();
        return res.status(200).json({
            success: true,
            message: 'Dashboard overview retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getDashboardKpis(req, res, next) {
    try {
        const data = await dashboardService.getDashboardKpis();
        return res.status(200).json({
            success: true,
            message: 'Dashboard KPIs retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getVehicleSummary(req, res, next) {
    try {
        const data = await dashboardService.getVehicleSummary();
        return res.status(200).json({
            success: true,
            message: 'Vehicle status summary retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getDriverSummary(req, res, next) {
    try {
        const data = await dashboardService.getDriverSummary();
        return res.status(200).json({
            success: true,
            message: 'Driver availability summary retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getTripSummary(req, res, next) {
    try {
        const data = await dashboardService.getTripSummary();
        return res.status(200).json({
            success: true,
            message: 'Trip status summary retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getRecentActivities(req, res, next) {
    try {
        const data = await dashboardService.getRecentActivities();
        return res.status(200).json({
            success: true,
            message: 'Recent activities retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}
