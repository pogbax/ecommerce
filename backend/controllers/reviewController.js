import Review from '../models/Review.js';
import Product from '../models/Product.js';

// Add a review
const addReview = async (req, res) => {
    const { productId, rating, comment } = req.body;
    const userId = req.user._id;

    try {
        const alreadyReviewed = await Review.findOne({ product: productId, user: userId });
        if (alreadyReviewed) {
            return res.status(400).json({ message: "Product already reviewed by user" });
        }

        const review = new Review({
            product: productId,
            user: userId,
            rating,
            comment
        });

        const savedReview = await review.save();

        // Update the product to include this review
        await Product.findByIdAndUpdate(productId, {
            $push: { reviews: savedReview._id }
        });

        res.status(201).json({ message: "Review added successfully", review: savedReview });
    } catch (error) {
        res.status(500).json({ message: "Error adding review", error: error.message });
    }
};

// Delete a review
const deleteReview = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    try {
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.user.toString() !== userId.toString() && !req.user.isAdmin) {
            return res.status(401).json({ message: "Not authorized to delete this review" });
        }

        await Review.findByIdAndDelete(id);
        // Update the product to remove the reference to the deleted review
        await Product.updateOne({ _id: review.product }, { $pull: { reviews: id } });

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting review", error: error.message });
    }
};

// Get reviews for a specific product
const getReviewsForProduct = async (req, res) => {
    const { productId } = req.params;

    try {
        const reviews = await Review.find({ product: productId })
            .populate('user', 'name');

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews found for this product" });
        }

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews", error: error.message });
    }
};

export { addReview, deleteReview, getReviewsForProduct };
