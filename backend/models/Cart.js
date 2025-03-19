import mongoose from "mongoose";

const cartSchema = mongoose.Schema({
   user: {
      type: mongoose.Schema.Types.ObjectId, ref: "User", required: true
   },
   items: [{
      product: {
         type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true
      },
      quantity: {
         type: Number, required: true, min: 1
      },
      addedAt: {
         type: Date, default: Date.now
      }
   }],
   totalPrice: {
      type: Number,
      required: true,
      default: 0
   },
   expiryDate: {
      type: Date,
      default: Date.now,
      expires: '7d'  // Optional, set a cart expiration (7 days in this example)
   }
}, {
   timestamps: true
});

// Optional: Method to validate stock before saving
cartSchema.methods.validateStock = async function() {
    for (const item of this.items) {
        const product = await Product.findById(item.product);
        if (product.stock < item.quantity) {
            throw new Error(`Not enough stock for ${product.name}`);
        }
    }
};

// Pre-save hook to clean empty items
cartSchema.pre('save', function(next) {
    this.items = this.items.filter(item => item.quantity > 0);
    next();
});

export default mongoose.model("Cart", cartSchema);
