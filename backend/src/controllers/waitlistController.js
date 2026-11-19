import { Waitlist } from "../models/Waitlist.js";
import { isDbConnected } from "../config/db.js";
import { sendWaitlistNotification } from "../services/emailService.js";

// In-memory fallback cache when MongoDB is not connected
const memoryWaitlist = new Map();

/**
 * Handle adding a user to the waiting list.
 */
export async function joinWaitlist(req, res) {
  try {
    const { email, platform = "all", source = "download_modal" } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const cleanPlatform = ["macos", "windows", "all", "other"].includes(
      String(platform).toLowerCase()
    )
      ? String(platform).toLowerCase()
      : "all";

    // Trigger email notification in background (non-blocking)
    sendWaitlistNotification({
      email: normalizedEmail,
      platform: cleanPlatform,
    }).catch((err) => {
      console.warn("[Waitlist Notification Warning]:", err?.message || err);
    });

    if (!isDbConnected()) {
      // Memory store fallback
      memoryWaitlist.set(normalizedEmail, {
        email: normalizedEmail,
        platform: cleanPlatform,
        source: String(source || "download_modal"),
        updatedAt: new Date().toISOString(),
        createdAt:
          memoryWaitlist.get(normalizedEmail)?.createdAt ||
          new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        message:
          "You're on the waiting list! We'll notify you as soon as downloads are ready.",
        entry: {
          email: normalizedEmail,
          platform: cleanPlatform,
        },
      });
    }

    // Upsert entry in MongoDB
    const existing = await Waitlist.findOne({ email: normalizedEmail });
    if (existing) {
      existing.platform = cleanPlatform;
      existing.source = source || existing.source;
      await existing.save();

      return res.status(200).json({
        success: true,
        message:
          "You're already on the waiting list! We've updated your platform preference.",
        entry: {
          email: normalizedEmail,
          platform: existing.platform,
        },
      });
    }

    const newEntry = await Waitlist.create({
      email: normalizedEmail,
      platform: cleanPlatform,
      source: String(source || "download_modal"),
    });

    return res.status(201).json({
      success: true,
      message:
        "You're on the waiting list! We'll notify you as soon as downloads are ready.",
      entry: {
        email: newEntry.email,
        platform: newEntry.platform,
      },
    });
  } catch (error) {
    console.error("[Waitlist Controller Error]:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to join waiting list. Please try again.",
    });
  }
}

/**
 * Get total waitlist count
 */
export async function getWaitlistStats(req, res) {
  try {
    if (!isDbConnected()) {
      return res.json({
        success: true,
        total: memoryWaitlist.size,
        database: "offline-cache",
      });
    }

    const total = await Waitlist.countDocuments();
    return res.json({
      success: true,
      total,
      database: "connected",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve waitlist statistics.",
    });
  }
}
