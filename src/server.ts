import "dotenv/config";
import app from "./app.js";
import { connectDB } from "@common/config/db.config.js";
import { connectToRedis } from "@common/config/redisClient.js";
import passport from "passport";
import "@common/config/passportConfig.js";
import { logger } from "./modules/common/service/logger.js";


const PORT = process.env.PORT;

connectDB();
connectToRedis();

app.use(passport.initialize());

app.listen(PORT, () => {
  logger.info({
    message: "Server is running",
    port: PORT
  });
});
