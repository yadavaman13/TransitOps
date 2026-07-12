import { Router } from 'express';
import { uploadFile } from '../controllers/upload.controller.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import { protect } from '../../auth/index.js';

const router = Router();

// Protect all upload routes
router.use(protect);

router.post('/', uploadSingle, uploadFile);

export default router;
