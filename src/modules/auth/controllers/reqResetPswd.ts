import { Request, Response } from "express";
import { User } from "../models/User.js";
import { HttpStatus } from "../../common/enums/StatusCodes.js";
import { generateOtp } from "../../auth/utils/generateOtp.js";
import { sendOTPEmail } from "../../common/utils/sendEmail.js";
import { AppError } from "@common/errors/appErrors.js";
import { cacheOtp } from "@auth/utils/redisHandling.js";
import { validateEmail } from "@auth/models/token.js";

const requestPasswordReset = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { error, value } = validateEmail(req.body)
  if(error){
    throw new AppError("Bad request", HttpStatus.BadRequest, error.details[0].message)
  }

  const user = await User.findOne({ email: value.email });
  if (!user) {
    throw new AppError("Bad Request", HttpStatus.BadRequest, "User not found");
  }

  const resetOtp = await generateOtp();

  await cacheOtp(value.email, resetOtp);

  const message = "You requested a password reset. Your 6-digit token is:";
  const result = await sendOTPEmail(value.email, resetOtp, message);
  if (!result) {
    throw new AppError(
      "Failed to send OTP email. Please try again later.",
      HttpStatus.ServerError,
    );
  }
  return res.status(HttpStatus.Success).json({
    status: "Success",
    message: "Password reset OTP sent to email",
  });
};

export default requestPasswordReset;
