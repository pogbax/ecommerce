import Wishlist from "../models/wishlist.js";
import Product from "../models/Product.js"; // Assuming you have this model
import mongoose from "mongoose";

// Get Wishlist
const getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found", products: [] });
        }
        res.status(200).json({ message: "Wishlist fetched successfully", products: wishlist.products });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ message: "Failed to fetch wishlist", error: error.message });
    }
};

// Add a Product to Wishlist
const addToWishlist = async (req, res) => {
    const { productId } = req.body;

    try {
        // Validate if product exists in the database
        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ message: "Product not found in catalog" });
        }

        // Add product to wishlist using $addToSet to prevent duplicates
        const wishlist = await Wishlist.findOneAndUpdate(
            { user: req.user._id }, // Find the wishlist for the user
            { $addToSet: { products: productId } }, // Add product without duplicates
            { new: true, upsert: true } // Create a new wishlist if it doesn't exist
        );

        res.status(201).json({ message: "Product added to wishlist successfully", wishlist });
    } catch (error) {
        console.error("Error adding product to wishlist:", error);
        res.status(500).json({ message: "Failed to add product to wishlist", error: error.message });
    }
};

// Remove a Product from Wishlist
const removeFromWishlist = async (req, res) => {
    const { productId } = req.params;

    try {
        // Validate `productId`
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        // Find the user's wishlist
        const wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found" });
        }

        // Check if the product exists in the wishlist
        const productExists = wishlist.products.some(
            (product) => product.toString() === productId
        );

        if (!productExists) {
            return res.status(404).json({ message: "Product not found in wishlist" });
        }

        // Remove the product from the wishlist
        await Wishlist.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { products: new mongoose.Types.ObjectId(productId) } }, // Use `new` with `ObjectId`
            { new: true }
        );

        res.status(200).json({ message: "Product removed from wishlist successfully" });
    } catch (error) {
        console.error("Error removing product from wishlist:", error);
        res.status(500).json({
            message: "Failed to remove product from wishlist",
            error: error.message
        });
    }
};


export { 
    getWishlist, 
    addToWishlist, 
    removeFromWishlist 
};