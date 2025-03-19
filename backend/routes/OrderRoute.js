import express from 'express';
import {
    createOrder,
    verifyPayment,
    getAllOrdersByUser,
    getOrderDetails,
    getAllOrdersOfAllUsers,
    updateOrderStatus
} from '../controllers/orderController.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Client routes
router.post('/', authenticate, createOrder);
router.post('/payment/callback/:tx_ref', authenticate, verifyPayment);
router.get('/myorders', authenticate, getAllOrdersByUser);
router.get('/:id', authenticate, getOrderDetails);

// Admin routes
router.get('/admin/allorders', authenticate, authorizeAdmin, getAllOrdersOfAllUsers);
router.put('/admin/:id/status', authenticate, authorizeAdmin, updateOrderStatus);

export default router;
