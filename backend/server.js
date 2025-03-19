import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";

import connectDB from "./config/db.js";
import userRoutes from "./routes/UserRoute.js";
import productRoutes from "./routes/ProductRoute.js";
import categoryRoutes from "./routes/CategoryRoute.js";
import reviewRoutes from "./routes/ReviewRoute.js";
import cartRoutes from "./routes/CartRoute.js";
import adressRoutes from './routes/AdressRoute.js';
import featureRoutes from './routes/FeatureRoute.js';
import orderRoute from './routes/OrderRoute.js'
import wishlistRoutes from './routes/WishListRoute.js'
const port = process.env.PORT || 8000;

const MONGO_URI = process.env.MONGO_URI;

connectDB(MONGO_URI);
const app = express();
app.use(cors());

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', adressRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/order', orderRoute);
app.use('/api/wishlist', wishlistRoutes);

app.listen(port, () => console.log(`Server is running on port ${port}`));
