// src/modules/auth/controllers/auth.controller.ts

import { Request, Response } from "express";
import { Token, validateEmail } from "../models/token.js";
import { sendOTPEmail } from "../../common/utils/sendEmail.js";
import { generateOtp } from "../utils/generateOtp.js";
import { HttpStatus } from "../../common/enums/StatusCodes.js";
import { checkUserExistingCache } from "@auth/utils/redisHandling.js";
import { AppError } from "@common/errors/appErrors.js";
import expressAsyncHandler from "express-async-handler";

export const getOtpController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    await getOtpService(req.body)

    res.status(HttpStatus.Success).json({
      status: "success",
      message: "OTP sent successfully",
      statusCode: "200",
    });
  },
);

export const getOtpService = async ({ email }: { email: string }) => {
   const { error } = validateEmail(email);
    if (error) {
      throw new AppError("Bad Request", HttpStatus.BadRequest, error.details[0].message);
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existingCache = await checkUserExistingCache(normalizedEmail);
    if (existingCache) {
      throw new AppError(
        "An OTP has already been sent to this email. Please verify the OTP or request for a new one.",
        HttpStatus.Conflict,
      );
    }
    const OTP = await generateOtp();

    const result = await sendOTPEmail(
      normalizedEmail,
      OTP,
      "Your one-time Email verification code is:",
    );

    if (!result) {
      throw new AppError(
        "Failed to send OTP email. Please try again later.",
        HttpStatus.ServerError,
      );
    }
}
