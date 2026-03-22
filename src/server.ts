import "dotenv/config";
import app from "./app";
import { connectDB } from "@common/config/db.config";
import { connectToRedis } from "@common/config/redisClient";
import passport from "passport";
import { sessionConfig } from "./modules/common/config/sessionConfig";
import { logger } from "./modules/common/service/logger"

const PORT = process.env.PORT;

connectDB();
connectToRedis();

app.use(sessionConfig());
app.use(passport.initialize());
app.use(passport.session());

app.listen(PORT, () => {
  logger.info({
    message: "Server is running",
    port: PORT
  });
});
