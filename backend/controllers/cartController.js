import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Get the current user's cart
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            return res.status(404).json({ message: "No cart found" });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error fetching cart", error: error.message });
    }
};

// Add an item to the cart
const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    try {
        const product = await Product.findById(productId);
        if (!product || quantity <= 0) {
            return res.status(400).json({ message: "Invalid product or quantity" });
        }
        if (quantity > product.stock) {
            return res.status(400).json({ message: "Insufficient stock available" });
        }

        // Ensure product price is valid
        if (product.price === undefined || isNaN(product.price)) {
            return res.status(400).json({ message: "Invalid product price detected" });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            let newQuantity = cart.items[itemIndex].quantity + quantity;
            if (newQuantity > product.stock) {
                return res.status(400).json({ message: "Exceeding stock limit" });
            }
            cart.items[itemIndex].quantity = newQuantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        // Calculate the total price correctly
        let totalPrice = 0;
        for (const item of cart.items) {
            const populatedProduct = await Product.findById(item.product);
            if (populatedProduct && populatedProduct.price && !isNaN(populatedProduct.price)) {
                totalPrice += populatedProduct.price * item.quantity;
            } else {
                console.error(`Invalid price for product ID ${item.product}`);
                return res.status(400).json({ message: "Invalid price for one or more products" });
            }
        }

        // Update total price in cart
        cart.totalPrice = totalPrice;

        await cart.save();
        const updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
        res.status(201).json(updatedCart);
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: "Error adding to cart", error: error.message });
    }
};

// Update an item in the cart
const updateCartItem = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            const product = await Product.findById(productId);
            if (quantity > product.stock) {
                return res.status(400).json({ message: "Insufficient stock available" });
            }
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error updating cart item", error: error.message });
    }
};

// Remove an item from the cart
const removeFromCart = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error removing item from cart", error: error.message });
    }
};

// Clear the cart
const clearCart = async (req, res) => {
    const userId = req.user._id;

    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = [];
        await cart.save();
        res.json({ message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ message: "Error clearing cart", error: error.message });
    }
};

export { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
