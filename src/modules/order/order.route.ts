import { Router } from "express";
import { previewCartController, initializeCheckoutController, verifyCheckoutController } from "./order.controller.js";
import verifyUserAcces from "@common/middlewares/verifyaccess.js";
import { Roles } from "@common/enums/roles.js";
import { Request, Response } from "express";
const router = Router();

router.use(verifyUserAcces([Roles.User]));

router.post("/initialize", initializeCheckoutController);
router.get("/preview", previewCartController);
router.get("/verify/:reference", verifyCheckoutController);

export default router;