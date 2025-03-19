import express from 'express';
import { addCategory, getAllCategories, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to get all categories
router.get('/', getAllCategories);

// Admin routes for category management
router.post('/', authenticate, authorizeAdmin, addCategory);
router.put('/:id', authenticate, authorizeAdmin, updateCategory);
router.delete('/:id', authenticate, authorizeAdmin, deleteCategory);

export default router;