import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        name: String,
        price: Number,
      },
    ],
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "Pending",
        "Processing",
        "Paid",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    trackingNumber: {
      type: String, // For delivery tracking
    },
    deliveredAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Chapa"],
      default: "Chapa",
    },
    paymentResult: {
      tx_ref: String, // Transaction reference from Chapa
      status: String, // Payment status
      payment_date: Date, // Date of payment
      amount: Number, // Amount paid
      payment_method: String, // e.g., card, bank transfer
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    notes: {
      type: String, // Optional: User's special instructions
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
