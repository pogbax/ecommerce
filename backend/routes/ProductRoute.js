import express from 'express';
import {
    addProduct,
    getAllProducts,
    editProduct,
    deleteProduct,
    getProductDetail,
    uploadImages
} from '../controllers/productController.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';
import upload from '../utils/multerConfig.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductDetail);

// Admin routes (protected)
router.post('/upload', authenticate, authorizeAdmin, upload.array('images', 5), uploadImages);
router.post('/', authenticate, authorizeAdmin, upload.array('images', 5), addProduct);
router.put('/:id', authenticate, authorizeAdmin, upload.array('images'), editProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);

export default router;