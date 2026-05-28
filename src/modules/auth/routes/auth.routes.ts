import { Router } from "express";
import registerUser from "../controllers/registerController.js";
import loginUser from "../controllers/loginController.js";
import { verifyOtp } from "../controllers/verifyOtp.js";
import { refreshToken } from "../controllers/refreshToken.js";
import changePassword from "../controllers/changePassword.js";
import verifyUserAcces from "../../common/middlewares/verifyaccess.js";
import verifyResetOtp from "../../auth/controllers/verifyResetOtp.js";
import resetPassword from "../../auth/controllers/resetPswd.js";
import requestPasswordReset from "../../auth/controllers/reqResetPswd.js";
import { otpRateLimiter } from "../utils/limiter.js";
import { Roles } from "@common/enums/roles.js"
import { updateRegisterOtpController } from "../../auth/controllers/sendNewregOtp.js";
import { authHealthController } from "../controllers/authHealtController.js";


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
