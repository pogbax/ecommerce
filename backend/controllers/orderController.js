import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import User from "../models/User.js";
import { initializeChapaPayment, verifyChapaPayment } from "../helper/chapa.js"; // Import helper functions

// Step 1: Create Order and Initialize Payment
const createOrder = async (req, res) => {
    const { user, orderItems, shippingAddress, totalPrice } = req.body;

    try {
        // Validate order details
        if (!user || !orderItems?.length || !shippingAddress || !totalPrice) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Verify user and address
        const [userDetail, address] = await Promise.all([
            User.findById(user),
            Address.findById(shippingAddress),
        ]);

        if (!userDetail || !address) {
            return res.status(400).json({ success: false, message: "Invalid user or address" });
        }

        // Generate unique transaction reference
        const tx_ref = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Prepare payment data for Chapa
        const paymentData = {
            amount: totalPrice.toString(),
            email: userDetail.email,
            first_name: userDetail.firstName || userDetail.username?.split(' ')[0] || 'Customer',
            last_name: userDetail.lastName || '',
            tx_ref,
            callback_url: `${process.env.BASE_URL}/api/orders/verify-payment/${tx_ref}`,
            return_url: `${process.env.FRONTEND_URL}/order-success/${tx_ref}`,
            customization: { title: "Order Payment", description: "Payment for your order" },
        };

        // Initialize payment
        const paymentResult = await initializeChapaPayment(paymentData);

        if (!paymentResult.success) {
            return res.status(400).json({ success: false, message: paymentResult.message });
        }

        // Create order in database
        const newOrder = new Order({
            user,
            orderItems,
            shippingAddress,
            totalPrice,
            paymentMethod: "Chapa",
            paymentResult: { tx_ref, status: "Pending" },
        });

        await newOrder.save();

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: newOrder,
            checkout_url: paymentResult.data.data.checkout_url, // Send checkout link
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ success: false, message: "Failed to create order" });
    }
};

const verifyPayment = async (req, res) => {
    const { tx_ref } = req.params;

    try {
        // Find order by transaction reference
        const order = await Order.findOne({ "paymentResult.tx_ref": tx_ref });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Verify payment with Chapa
        const verificationResult = await verifyChapaPayment(tx_ref);

        if (verificationResult.success) {
            order.isPaid = true;
            order.status = "Paid";
            order.paidAt = new Date();
            order.paymentResult = {
                ...order.paymentResult,
                status: "success",
                payment_date: new Date(),
            };

            await order.save();

            // Update product stock
            await Promise.all(
                order.orderItems.map(async (item) => {
                    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
                })
            );

            return res.status(200).json({ success: true, message: "Payment verified", data: order });
        }

        res.status(400).json({ success: false, message: "Payment verification failed" });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, message: "Payment verification failed" });
    }
};

const getAllOrdersByUser = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate("orderItems.product", "name price")
            .populate("shippingAddress");

        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
};

const getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        })
        .populate('orderItems.product', 'name price')
        .populate('shippingAddress')
        .populate('user', 'username email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch order details"
        });
    }
};

// Admin Controllers
const getAllOrdersOfAllUsers = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'username email')
            .populate('orderItems.product', 'name price')
            .populate('shippingAddress')
            .sort('-createdAt');

        if (!orders.length) {
            return res.status(404).json({
                success: false,
                message: "No orders found"
            });
        }

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch orders"
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status, isDelivered } = req.body;
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        order.status = status;
        order.isDelivered = isDelivered;
        if (isDelivered) {
            order.deliveredAt = new Date();
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update order status"
        });
    }
};

export {
    createOrder,
    verifyPayment,
    getAllOrdersByUser,
    getOrderDetails,
    getAllOrdersOfAllUsers,
    updateOrderStatus
};