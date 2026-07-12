import { Router } from 'express';
import * as vehicleDocumentController from '../controllers/vehicleDocument.controller.js';
import { protect, restrictTo } from '../../auth/middleware/auth.middleware.js';
import { uploadValidator, documentIdValidator, vehicleIdValidator } from '../validators/vehicleDocument.validator.js';

const router = Router();

// All routes require authentication
router.use(protect);

// Document routes
router.post('/', restrictTo('FLEET_MANAGER', 'ADMIN'), uploadValidator, vehicleDocumentController.upload);
router.get('/:vehicleId', vehicleIdValidator, vehicleDocumentController.list);
router.patch('/:id', restrictTo('FLEET_MANAGER', 'ADMIN'), documentIdValidator, vehicleDocumentController.update);
router.delete('/:id', restrictTo('FLEET_MANAGER', 'ADMIN'), documentIdValidator, vehicleDocumentController.deleteDocument);
router.get('/:id/download', documentIdValidator, vehicleDocumentController.download);

export default router;
