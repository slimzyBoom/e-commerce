import { Router } from "express";
import { previewCartController } from "./order.controller.js";
import verifyUserAcces from "@common/middlewares/verifyaccess.js";
import { Roles } from "@common/enums/roles.js";

const router = Router();

router.use(verifyUserAcces([Roles.User]));
router.get("/preview", previewCartController);

export default router;