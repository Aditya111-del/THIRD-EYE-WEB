import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB, isDbConnected } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize MongoDB connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Third Eye Backend API",
    database: isDbConnected() ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// IDE Status endpoint
app.get("/api/ide/status", (req, res) => {
  res.json({
    appName: "Third Eye IDE",
    version: "1.0.0",
    features: [
      "Agentic coding IDE",
      "Perspective workspace",
      "Context review engine",
      "Dual workspace mode",
      "MongoDB User Auth (Email, Phone, Google, Apple)",
    ],
    database: isDbConnected() ? "connected" : "disconnected",
    status: "operational",
  });
});

// 404 handler for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[Backend Uncaught Error]:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Third Eye Backend running on http://localhost:${PORT}`);
});
