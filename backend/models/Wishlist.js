import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensure one wishlist per user
      index: true,  // Add an index for faster lookups
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
  },
  {
    timestamps: true, // Automatically track createdAt and updatedAt
  }
);

// Custom validation to prevent duplicate products in the wishlist
wishlistSchema.path("products").validate(function (products) {
  const uniqueProducts = [...new Set(products.map((product) => product.toString()))];
  return uniqueProducts.length === products.length;
}, "Duplicate products are not allowed in the wishlist.");

// Alternatively, you can handle duplicates at the query level using MongoDB's $addToSet operator.

// Create a model from the schema
const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;