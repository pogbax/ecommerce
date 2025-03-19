import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/createToken.js";

//@desc Auth user & get token
//@route POST /api/users/auth
//@access Public
const authUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            generateToken(res, user._id, user.isAdmin);
            res.status(200).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//@desc Register new user
//@route POST /api/users
//@access Public
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const duplicate = await User.findOne({ email });
        if (duplicate) return res.status(400).json({ message: "User already exists" });

        // Ensure admin domains are an array
        const adminDomains = process.env.ADMIN_DOMAINS.split(","); // Handle multiple domains
        const emailDomain = email.split('@')[1];
        const isAdmin = adminDomains.includes(emailDomain);

        const user = new User({ username, email, password, isAdmin });
        // Hash password before saving the user
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        res.status(201).json({
            message: "User registered successfully",
            userId: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//@desc Logout user
//@route POST /api/users/logout
//@access Public
const logoutUser = async (req, res) => {
    res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ message: "Logged out successfully" });
};

//@desc Get user profile
//@route GET /api/users/profile
//@access Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//@desc Update user profile
//@route PUT /api/users/profile
//@access Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                // Hash password before saving
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();
            res.status(200).json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//@desc Get all users (Admin only)
//@route GET /api/users
//@access Private
const getAllUsers = async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized as an admin' });
    }
    try {
        const users = await User.find({}).select("-password -refreshToken");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

//@desc Delete user (Admin only)
//@route DELETE /api/users/:id
//@access Private
const deleteUser = async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized as an admin' });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.remove();
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing user', error: error.message });
    }
};

export {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,
    getAllUsers
};
