import express from "express";
import {
  getOrderHistory,
  getOrderDetails,
  cancelOrder,
  getOrderStatusOptions,
} from "../controller/orderController.js";
import verifyUserAcces from "../../common/middlewares/verifyaccess.js";
import { createOrder } from "../controller/createOrder.js";
import { Roles } from "@common/enums/roles.js";
const router = express.Router();

router.use(verifyUserAcces([Roles.User, Roles.Admin]));

router.get("/history", getOrderHistory);
router.post("/create-order", createOrder);

router.get("/:orderId", getOrderDetails);

router.post("/:orderId/cancel", cancelOrder);

router.get("/status-options", getOrderStatusOptions);

export default router;
