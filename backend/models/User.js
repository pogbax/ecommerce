import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// User schema
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"], // Email regex validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // You can adjust the password strength requirements here
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Hash password before saving user
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    return next(); // If password is not modified, skip hashing
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error); // Pass error to the next middleware
  }
});

export default mongoose.model("User", userSchema);
