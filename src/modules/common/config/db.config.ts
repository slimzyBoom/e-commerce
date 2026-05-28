import mongoose from "mongoose";
import { logger } from "../service/logger.js";

mongoose.connection.on("connected", () => {
  logger.info({ message: "MongoDB connected successfully" });
});

mongoose.connection.on("disconnected", () => {
  logger.info({ message: "MongoDB disconnected" });
});

mongoose.connection.on("error", (err) => {
  logger.error({
    message: "MongoDB connection error",
    error: err instanceof Error ? err.message : String(err),
  });
});

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL as string, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ message: "Failed to connect to MongoDB", error: message });
    process.exit(1);
  }
};
