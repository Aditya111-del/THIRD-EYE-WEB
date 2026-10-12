import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { isDbConnected } from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "thirdeye_dev_jwt_secret_key_987456321";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export async function protect(req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No authentication token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!isDbConnected()) {
      if (process.env.DEV_MOCK_STORAGE === "true") {
        req.user = {
          id: decoded.id,
          name: "Dev Mock User",
          email: "dev@thirdeye.dev",
          phone: "+1234567890",
          role: "developer",
          authProvider: "local",
        };
        return next();
      }

      return res.status(503).json({
        success: false,
        message: "Database connection unavailable. Please check backend MongoDB configuration.",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User session expired or user no longer exists.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
      error: error.message,
    });
  }
}
