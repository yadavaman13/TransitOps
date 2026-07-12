import { Router } from 'express';
import * as tripController from '../controllers/trip.controller.js';
import { protect, restrictTo } from '../../auth/index.js';

const router = Router();

router.use(protect);

const allowedReaderRoles = ['FLEET_MANAGER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST', 'ADMIN'];
const allowedWriterRoles = ['FLEET_MANAGER', 'ADMIN'];

router.get('/', restrictTo(...allowedReaderRoles, 'DRIVER'), tripController.getTrips);
router.get('/:id', restrictTo(...allowedReaderRoles, 'DRIVER'), tripController.getTripDetails);
router.get('/:id/timeline', restrictTo(...allowedReaderRoles, 'DRIVER'), tripController.getTripTimeline);

// Write routes (Managers / Admins)
router.post('/', restrictTo(...allowedWriterRoles), tripController.createTrip);
router.patch('/:id', restrictTo(...allowedWriterRoles), tripController.updateTrip);
router.delete('/:id', restrictTo(...allowedWriterRoles), tripController.deleteTrip);

router.post('/:id/dispatch', restrictTo(...allowedWriterRoles), tripController.dispatchTrip);
router.post('/:id/cancel', restrictTo(...allowedWriterRoles), tripController.cancelTrip);

router.patch('/:id/assign-driver', restrictTo(...allowedWriterRoles), tripController.assignDriver);
router.patch('/:id/assign-vehicle', restrictTo(...allowedWriterRoles), tripController.assignVehicle);
router.patch('/:id/cargo', restrictTo(...allowedWriterRoles), tripController.updateCargo);
router.patch('/:id/distance', restrictTo(...allowedWriterRoles), tripController.updateDistance);

// Driver state transition routes (Allowed for Drivers who are assigned, and Managers/Admins)
router.post('/:id/start', restrictTo(...allowedWriterRoles, 'DRIVER'), tripController.startTrip);
router.post('/:id/complete', restrictTo(...allowedWriterRoles, 'DRIVER'), tripController.completeTrip);

export default router;
