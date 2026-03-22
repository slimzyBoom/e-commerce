import { createClient } from "redis";
import { logger } from "../../common/service/logger";

export const redisClient = createClient({
  username: process.env.REDIS_USERNAME as string,
  password: process.env.REDIS_PASSWORD as string,
  socket: {
    host: process.env.REDIS_HOST as string,
    port: parseInt(process.env.REDIS_PORT as string, 10),
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error({
          message: "Redis reconnect failed after several attempts",
        });
        return new Error("Redis reconnect failed");
      }
      // Retry every 3 seconds
      return 3000;
    },
  },
});

redisClient.on("connect", () => {
  logger.info({ message: "Redis connected successfully" })
});

redisClient.on("disconnect", () => {
  logger.info({ message: "Redis disconnected" })
})

redisClient.on("error", (err) => {
  logger.error({
    message: `Redis connection error`,
    error: err instanceof Error ? err.message : String(err)
  })
});

export const connectToRedis = async () => {
  try {
    if(!redisClient.isOpen){
      await redisClient.connect()
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error({
      message: `Failed to connect to Redis`,
      error
    })
  }
};
