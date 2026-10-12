import { Router } from "express";
import {
  register,
  login,
  continueWithGoogle,
  continueWithApple,
  getMe,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Public auth endpoints
router.post("/register", register);
router.post("/login", login);
router.post("/google", continueWithGoogle);
router.post("/apple", continueWithApple);

// Protected user endpoints
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

export default router;
