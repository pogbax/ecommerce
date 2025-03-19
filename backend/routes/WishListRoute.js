import express from 'express';
import {
    addToWishlist,
    removeFromWishlist,
    getWishlist
} from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);  // Apply authentication middleware to all routes

//get wishlists
router.get('/', getWishlist);
//add a Product to wishlist
router.post('/add', addToWishlist);
//remove a Product from wishlist
router.delete('/remove/:productId', removeFromWishlist);

export default router;