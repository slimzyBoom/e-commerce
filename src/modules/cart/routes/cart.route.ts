import { Router } from "express";
import { optionalVerifyAccess } from "@common/middlewares/optionalVerifyAccess.js";

const router = Router();
import {
  getCartProducts,
  addCartProduct,
  updateCartProduct,
  removeCartProduct,
} from "../controllers/cartControllers.js";


router.use(optionalVerifyAccess);

router
  .route("/")
  .get(getCartProducts)
  .post(addCartProduct)
  .patch(updateCartProduct)
  .delete(removeCartProduct);

export default router;
