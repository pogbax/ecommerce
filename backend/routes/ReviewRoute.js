import express from 'express';
import { addReview, deleteReview, getReviewsForProduct } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, addReview);
router.delete('/:id', authenticate, deleteReview);
router.get('/:productId', authenticate, getReviewsForProduct);

export default router;
