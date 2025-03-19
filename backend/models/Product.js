import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true // Added index for better search performance
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    max:1000000
  },
  mainImage: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category", 
    required: true,
    index: true // Index for fast category filtering
  },
  materials: [{
    type: String,
    required: true
  }],
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Review"
  }],
  types: [{
    type: String,
    required: true,
    enum: ['leather sofa', 'cotton sofa', 'wooden chair', 'metal chair', 'plastic table'] // Example types
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBest:{
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model("Product", productSchema);
