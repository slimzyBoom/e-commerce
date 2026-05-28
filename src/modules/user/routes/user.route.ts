import { Router } from "express";
import { getUserProfile } from "../controllers/UserProfile.js"; // Import your controller functions
import verifyUserAcces from "../../common/middlewares/verifyaccess.js";
import { updateUserProfile } from "../controllers/updateUser.js";
import { Roles } from "../../common/enums/roles.js";
import upload from "@common/config/multerConfig.js";

const router = Router();

router.use(verifyUserAcces([Roles.User, Roles.Admin]));
router.get("/profile", getUserProfile);
router.patch("/profile", upload.single("avatar"), updateUserProfile);

// router.get('/api/v1/orders/:userId', verifyUser, getUserOrders);
// router.put('/api/v1/payment/:userId', verifyUser, updatePaymentInformation);

export default router;
