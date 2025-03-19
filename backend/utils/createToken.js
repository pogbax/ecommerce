import jwt from "jsonwebtoken";

const generateToken = (res, userId, isAdmin) => {
  // Ensure the secret is defined
  const secret = isAdmin
    ? process.env.JWT_SECRET_ADMIN
    : process.env.JWT_SECRET_USER;

  if (!secret) {
    throw new Error("JWT Secret is not defined in environment variables");
  }

  // Generate token
  const token = jwt.sign({ userId, isAdmin }, secret, {
    expiresIn: "30d",
  });

  // Set JWT in the cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development", // Ensure cookie is only sent over HTTPS in production
    sameSite: "strict", // Protect against CSRF
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  });

  // Return the token for further use
  return token;
};

export default generateToken;
