
import { Router } from "express";
import DeliveryAddressController from "./delivery.controller.js";
import verifyUserAcces from "../common/middlewares/verifyaccess.js";
import { Roles } from "@common/enums/roles.js";


const router = Router();

router.use(verifyUserAcces([Roles.User, Roles.Admin]));
router.post("/address", DeliveryAddressController.createAddress);

router.get("/address", DeliveryAddressController.getUserAddresses);

router.get("/address/:id", DeliveryAddressController.getAddressById);

router.put("/address/:id", DeliveryAddressController.updateAddress);

router.delete("/address/:id", DeliveryAddressController.deleteAddress);

export default router;
