import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/thirdeye";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on("disconnected", () => {
      isConnected = false;
      console.warn("[MongoDB] Connection lost. Reconnecting...");
    });

    mongoose.connection.on("reconnected", () => {
      isConnected = true;
      console.log("[MongoDB] Reconnected successfully.");
    });
  } catch (error) {
    isConnected = false;
    console.warn(
      `[MongoDB] Notice: Could not connect to MongoDB at "${uri}".\n` +
      `          Reason: ${error.message}\n` +
      `          The server is still running. You can update MONGODB_URI in backend/.env with your MongoDB Atlas or local connection string.`
    );
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
