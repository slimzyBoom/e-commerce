import { Router } from "express";
import verifyUserAcces from "../../common/middlewares/verifyaccess";
import { Roles } from "@common/enums/roles";

const router = Router();
import {
  getProducts,
  addProduct,
  updateProductQuantity,
  deleteProduct,
} from "../controllers/cartControllers";


router.use(verifyUserAcces([Roles.User]));
router
  .route("/")
  .get(getProducts)
  .post(addProduct)
  .put(updateProductQuantity)
  .delete(deleteProduct);

export default router;
