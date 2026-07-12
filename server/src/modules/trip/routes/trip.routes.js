import { Router } from 'express';
import * as tripController from '../controllers/trip.controller.js';
import { protect, restrictTo } from '../../auth/index.js';

const router = Router();

router.use(protect);

const allowedReaderRoles = ['Fleet Manager', 'Safety Officer', 'Financial Analyst', 'ADMIN'];
const allowedWriterRoles = ['Fleet Manager', 'ADMIN'];

router.get('/', restrictTo(...allowedReaderRoles, 'Driver'), tripController.getTrips);
router.get('/:id', restrictTo(...allowedReaderRoles, 'Driver'), tripController.getTripDetails);
router.get('/:id/timeline', restrictTo(...allowedReaderRoles, 'Driver'), tripController.getTripTimeline);

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
router.post('/:id/start', restrictTo(...allowedWriterRoles, 'Driver'), tripController.startTrip);
router.post('/:id/complete', restrictTo(...allowedWriterRoles, 'Driver'), tripController.completeTrip);

export default router;
