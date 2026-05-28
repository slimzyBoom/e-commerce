import { Router } from "express";
import { addReviewController, updateReviewController, getAllProductReviewController, deleteReviewController } from "../controller/reviewController.js";
import verifyUserAcces from "@common/middlewares/verifyaccess.js";
import { Roles } from "@common/enums/roles.js";
const router = Router();

router.get("/:productId", getAllProductReviewController);

router.use(verifyUserAcces([Roles.User]))
router.post("/:productId", addReviewController);
router.patch("/:reviewId", updateReviewController);
router.delete("/:reviewId", deleteReviewController);

export default router;