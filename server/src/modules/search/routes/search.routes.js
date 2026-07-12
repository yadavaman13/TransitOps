import { Router } from 'express';
import * as searchController from '../controllers/search.controller.js';
import { protect } from '../../auth/middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(protect);

// Search routes
router.get('/', searchController.globalSearch);
router.get('/vehicles', searchController.searchVehicles);
router.get('/drivers', searchController.searchDrivers);
router.get('/trips', searchController.searchTrips);

export default router;
