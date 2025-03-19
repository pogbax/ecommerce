import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';
import {
    getFeatures,
    addFeature,
    updateFeature,
    deleteFeature
} from '../controllers/featureController.js';
import upload from '../utils/multerConfig.js';

const router = express.Router();

// Public route to get all features
router.get('/', getFeatures);

// Admin routes (protected and handle file uploads)
router.post('/add', authenticate, authorizeAdmin, upload.array('images', 10), addFeature);
router.put('/:featureId', authenticate, authorizeAdmin, upload.array('images', 10), updateFeature);
router.delete('/:featureId', authenticate, authorizeAdmin, deleteFeature);

export default router;
