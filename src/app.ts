import "express-async-errors";
import "tsconfig-paths/register";
import express from "express";
import cors from "cors";
import corsOptions from "./modules/common/config/corsOptions.config";
import stateRoute from "./modules/states/routes/states.routes";
import userRoute from "./modules/user/routes/user.route";
import orderRoute from "./modules/orders/routes/order.route";
import productRoute from "./modules/product/routes/product.route";
import authRoute from "./modules/auth/routes/auth.routes";
import googleAuth from "./modules/auth/routes/google.routes";
import cookieParser from "cookie-parser";
import cartRoute from "./modules/cart/routes/cart.route";
import deliveryRoute from "./modules/delivery-add/deliveryAdd.route";
import helmet from "helmet";
import { errorHandler } from "./modules/common/middlewares/errorHandler";
import path from "path";
import { logger } from "@common/service/logger";
import pinoHttp from "pino-http";
import { v4 as uuidv4 } from "uuid";

const app = express();

app.use(
  pinoHttp({
    logger,
    genReqId: (req) => {
      const requestId = req.headers["x-request-id"];
      return typeof requestId === "string" ? requestId : uuidv4();
    },
    serializers: {
      req: (req) => {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
        };
      },
      res: (res) => {
        return {
          statusCode: res.statusCode,
        }
      }
    },
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet());

app.get("/", (req, res) => {
  res.send("E-Commerce API is running...");
});

app.use("/auth/v1/google", googleAuth);
app.use("/auth/v1", authRoute);

app.use("/api", stateRoute);
app.use("/user", userRoute);
app.use("/cart", cartRoute);
app.use("/products", productRoute);
app.use("/delivery", deliveryRoute);
app.use("/orders", orderRoute);

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

export default app;
