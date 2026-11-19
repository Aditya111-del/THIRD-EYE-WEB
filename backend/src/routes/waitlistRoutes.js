import { Router } from "express";
import { joinWaitlist, getWaitlistStats } from "../controllers/waitlistController.js";

const router = Router();

// Public waitlist endpoints
router.post("/", joinWaitlist);
router.get("/stats", getWaitlistStats);

export default router;

