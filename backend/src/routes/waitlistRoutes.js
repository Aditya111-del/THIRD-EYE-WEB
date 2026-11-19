import { Router } from "express";
import {
  joinWaitlist,
  getWaitlistStats,
  testEmailEndpoint,
} from "../controllers/waitlistController.js";

const router = Router();

// Public waitlist endpoints
router.post("/", joinWaitlist);
router.get("/stats", getWaitlistStats);
router.get("/test-email", testEmailEndpoint);

export default router;

