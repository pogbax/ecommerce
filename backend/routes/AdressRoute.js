import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress
} from '../controllers/adressController.js';

const router = express.Router();

router.use(authenticate);  // Apply authentication middleware to all routes

router.get('/', getAddresses);
router.post('/add', addAddress);
router.put('/:addressId', updateAddress);
router.delete('/:addressId', deleteAddress);

export default router;
