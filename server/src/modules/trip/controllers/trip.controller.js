import * as tripService from '../services/trip.service.js';

export async function createTrip(req, res, next) {
    try {
        const createdById = req.user.id;
        const data = await tripService.createTrip(req.body, createdById);
        return res.status(201).json({
            success: true,
            message: 'Trip created successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getTrips(req, res, next) {
    try {
        const filters = {
            status: req.query.status,
            driverId: req.query.driverId,
            vehicleId: req.query.vehicleId,
        };

        // If the logged in user is a DRIVER, they can only access their own trips
        if (req.user.role === 'DRIVER') {
            filters.driverId = req.user.id;
        }

        const data = await tripService.getTrips(filters);
        return res.status(200).json({
            success: true,
            message: 'Trips retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getTripDetails(req, res, next) {
    try {
        const data = await tripService.getTripDetails(req.params.id);
        
        // If driver, verify they are assigned to this trip
        if (req.user.role === 'DRIVER' && data.driverId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this trip',
                data: null,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Trip details retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateTrip(req, res, next) {
    try {
        const data = await tripService.updateTrip(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: 'Trip updated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteTrip(req, res, next) {
    try {
        await tripService.deleteTrip(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Trip deleted successfully',
            data: null,
        });
    } catch (error) {
        next(error);
    }
}

export async function dispatchTrip(req, res, next) {
    try {
        const data = await tripService.dispatchTrip(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Trip dispatched successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function startTrip(req, res, next) {
    try {
        const data = await tripService.startTrip(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Trip started successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function completeTrip(req, res, next) {
    try {
        const data = await tripService.completeTrip(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: 'Trip completed successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function cancelTrip(req, res, next) {
    try {
        const data = await tripService.cancelTrip(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Trip cancelled successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function assignDriver(req, res, next) {
    try {
        const { driverId } = req.body;
        const data = await tripService.assignDriver(req.params.id, driverId);
        return res.status(200).json({
            success: true,
            message: 'Driver assigned to trip successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function assignVehicle(req, res, next) {
    try {
        const { vehicleId } = req.body;
        const data = await tripService.assignVehicle(req.params.id, vehicleId);
        return res.status(200).json({
            success: true,
            message: 'Vehicle assigned to trip successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateCargo(req, res, next) {
    try {
        const { cargoName, cargoWeight } = req.body;
        const data = await tripService.updateCargo(req.params.id, cargoName, cargoWeight);
        return res.status(200).json({
            success: true,
            message: 'Cargo details updated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateDistance(req, res, next) {
    try {
        const { distanceKm } = req.body;
        const data = await tripService.updateDistance(req.params.id, distanceKm);
        return res.status(200).json({
            success: true,
            message: 'Distance details updated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getTripTimeline(req, res, next) {
    try {
        const data = await tripService.getTripTimeline(req.params.id);
        
        // If driver, verify they are assigned to this trip
        if (req.user.role === 'DRIVER' && data.trip.driverId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this trip timeline',
                data: null,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Trip timeline retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}
