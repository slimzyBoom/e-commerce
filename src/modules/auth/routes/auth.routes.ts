import { Router } from "express";
import registerUser from "../controllers/registerController";
import loginUser from "../controllers/loginController";
import { verifyOtp } from "../controllers/verifyOtp";
import { refreshToken } from "../controllers/refreshToken";
import changePassword from "../controllers/changePassword";
import verifyUserAcces from "../../common/middlewares/verifyaccess";
import verifyResetOtp from "../../auth/controllers/verifyResetOtp";
import resetPassword from "../../auth/controllers/resetPswd";
import requestPasswordReset from "../../auth/controllers/reqResetPswd";
import { otpRateLimiter } from "../utils/limiter";
import { Roles } from "@common/enums/roles"
import { updateRegisterOtpController } from "../../auth/controllers/sendNewregOtp";
import { authHealthController } from "../controllers/authHealtController";

const router = Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/generate-otp", otpRateLimiter, updateRegisterOtpController);
router.get("/health", authHealthController);
router.post("/request-password-reset", requestPasswordReset);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

router.use(verifyUserAcces([Roles.User]));
router.patch("/change-password", changePassword);


export default router;
