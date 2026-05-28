import { Request, Response } from "express";
import { HttpStatus } from "../../common/enums/StatusCodes.js";
import { getOtpFromCache } from "@auth/utils/redisHandling.js";
import { validateOtpInput } from "../models/User.js";
import { AppError } from "@common/errors/appErrors.js";
import { logger } from "@common/service/logger.js"
import { sanitizeEmail } from "@common/utils/sanitizeInput.js";

const verifyResetOtp = async (req: Request, res: Response) => {
  const { otp, email } = req.body;
  const { error } = validateOtpInput({ otp, email });
  if (error) {
    throw new AppError(
      "Bad Request",
      HttpStatus.BadRequest,
      error.details[0].message,
    );
  }

  const otpFromCache = await getOtpFromCache(email);

  if (!otpFromCache) {
    logger.error({email : sanitizeEmail(email), action : "verify rest otp"}, "Error getting otp from cache")
    throw new AppError("Bad Request", HttpStatus.BadRequest, "OTP not found.");
  }

  if (otpFromCache !== otp) {
    throw new AppError(
      "Bad Request",
      HttpStatus.BadRequest,
      "OTP is incorrect. Please try again.",
    );
  }

  return res.status(HttpStatus.Success).json({
    status: "Success",
    message: "OTP has been verified. You can now reset your password.",
  });
};

export default verifyResetOtp;
