import { Router } from "express";
import verifyUserAcces from "../../common/middlewares/verifyaccess.js";
import { Roles } from "@common/enums/roles.js";

const router = Router();
import {
  getCartProducts,
  addCartProduct,
  updateCartProduct,
  removeCartProduct,
} from "../controllers/cartControllers.js";

// router.use(verifyUserAcces([Roles.User]));
router
  .route("/")
  .get(getCartProducts)
  .post(addCartProduct)
  .patch(updateCartProduct)
  .delete(removeCartProduct);

export default router;
