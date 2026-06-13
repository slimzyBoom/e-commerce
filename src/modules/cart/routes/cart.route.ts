import { Router } from "express";
<<<<<<< Updated upstream
import verifyUserAcces from "../../common/middlewares/verifyaccess.js";
import { Roles } from "@common/enums/roles.js";
=======
<<<<<<< Updated upstream
import verifyUserAcces from "../../common/middlewares/verifyaccess";
import { Roles } from "@common/enums/roles";
=======
import { optionalVerifyAccess } from "@common/middlewares/optionalVerifyAccess.js";
import { Roles } from "@common/enums/roles.js";
>>>>>>> Stashed changes
>>>>>>> Stashed changes

const router = Router();
import {
  getCartProducts,
  addCartProduct,
  updateCartProduct,
  removeCartProduct,
} from "../controllers/cartControllers.js";

<<<<<<< Updated upstream
// router.use(verifyUserAcces([Roles.User]));
=======
<<<<<<< Updated upstream

router.use(verifyUserAcces([Roles.User]));
=======
router.use(optionalVerifyAccess);
>>>>>>> Stashed changes
>>>>>>> Stashed changes
router
  .route("/")
  .get(getCartProducts)
  .post(addCartProduct)
  .patch(updateCartProduct)
  .delete(removeCartProduct);

export default router;
