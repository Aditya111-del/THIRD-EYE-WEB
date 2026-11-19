import mongoose from "mongoose";

const waitlistSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    platform: {
      type: String,
      enum: ["macos", "windows", "all", "other"],
      default: "all",
    },
    source: {
      type: String,
      default: "download_modal",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Optimize search by email
waitlistSchema.index({ email: 1 });

export const Waitlist = mongoose.model("Waitlist", waitlistSchema);

