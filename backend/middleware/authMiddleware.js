import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authenticate = async (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    try {
      // Try with user secret first
      let decoded = jwt.verify(token, process.env.JWT_SECRET_USER);
      req.user = await User.findById(decoded.userId).select("-password");
      req.user.isAdmin = false;
      next();
    } catch (userError) {
      // If user token verification fails, try admin secret
      try {
        let decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
        req.user = await User.findById(decoded.userId).select("-password");
        req.user.isAdmin = true;
        next();
      } catch (adminError) {
        res.status(401).json({ message: "Not authorized, token failed." });
      }
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token." });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

export { authenticate, authorizeAdmin };