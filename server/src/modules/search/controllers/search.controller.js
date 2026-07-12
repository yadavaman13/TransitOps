import * as searchService from '../services/search.service.js';
import { sendResponse } from '../../../utils/response.utlis.js';

/**
 * GET /api/search
 * Global search across vehicles, drivers, and trips
 */
export async function globalSearch(req, res, next) {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return sendResponse({
                res,
                statusCode: 400,
                message: 'Search query must be at least 2 characters',
                success: false,
            });
        }

        const limit = parseInt(req.query.limit) || 10;
        const results = await searchService.globalSearch(q.trim(), { limit });

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Search completed',
            success: true,
            data: results,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/search/vehicles
 * Search vehicles
 */
export async function searchVehicles(req, res, next) {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return sendResponse({
                res,
                statusCode: 400,
                message: 'Search query must be at least 2 characters',
                success: false,
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const vehicles = await searchService.searchVehicles(q.trim(), { limit, offset });

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Vehicle search completed',
            success: true,
            data: { vehicles },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/search/drivers
 * Search drivers
 */
export async function searchDrivers(req, res, next) {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return sendResponse({
                res,
                statusCode: 400,
                message: 'Search query must be at least 2 characters',
                success: false,
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const drivers = await searchService.searchDrivers(q.trim(), { limit, offset });

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Driver search completed',
            success: true,
            data: { drivers },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/search/trips
 * Search trips
 */
export async function searchTrips(req, res, next) {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return sendResponse({
                res,
                statusCode: 400,
                message: 'Search query must be at least 2 characters',
                success: false,
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const trips = await searchService.searchTrips(q.trim(), { limit, offset });

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Trip search completed',
            success: true,
            data: { trips },
        });
    } catch (error) {
        next(error);
    }
}
