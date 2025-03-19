import express from 'express';
import {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,
    getAllUsers
} from '../controllers/userController.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Authentication routes
router.post('/auth', authUser); // Login route
router.post('/register', registerUser); // Registration route
router.post('/logout', logoutUser); // Logout route

// User profile routes
router.get('/profile', authenticate, getUserProfile); // Get user profile, requires authentication
router.put('/profile', authenticate, updateUserProfile); // Update user profile, requires authentication

// Admin routes
router.get('/', authenticate, authorizeAdmin, getAllUsers); // Get all users, requires admin access
router.delete('/:id', authenticate, authorizeAdmin, deleteUser); // Delete a user, requires admin access

export default router;
