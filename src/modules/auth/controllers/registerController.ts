import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { User } from "../models/User";
import { validateRegisterInput } from "../models/User";
import { hashPassword } from "../../common/utils/hashPassword";
import { HttpStatus } from "../../common/enums/StatusCodes";
import { generateOtp } from "../utils/generateOtp";
import sendOTPEmail from "../../common/utils/sendEmail";
import "../../interfaces/session";
import { OTP_STATIC_VALUE } from "../../auth/static/otp.static";
import { redisClient } from "../../common/config/redisClient";
import { sanitizeEmail } from "@common/utils/sanitizeInput";

const registerUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { firstname, lastname, state, email, password } = req.body;
    const { error } = validateRegisterInput(req.body);
    const { OTP_EXPIRY_TIME } = OTP_STATIC_VALUE;

    if (error) {
      const errorDetails = error.details[0].message;
      res.status(HttpStatus.BadRequest).json({
        status: "Bad request",
        message: errorDetails,
        statusCode: HttpStatus.BadRequest,
      });
      return;
    }
    const duplicate = await User.findOne({ email }).lean().exec();

    if (duplicate) {
      res.status(HttpStatus.Conflict).json({
        status: "Conflict",
        message: "User with email already exists",
        statusCode: HttpStatus.Conflict,
      });
      // req.log.warn({
      //   message: "User already exists",
      //   email: sanitizeEmail(email),
      // })
      return;
    }
    const otpExpiry = OTP_EXPIRY_TIME / 1000;
    const OTP = await generateOtp();
    const hashedPassword = await hashPassword(password);

    const existingCache = await redisClient.hGetAll(`pending_user:${email}`);
    if (existingCache && Object.keys(existingCache).length > 0) {
      res.status(HttpStatus.Conflict).json({
        status: "Conflict",
        message:
          " An OTP has already been sent to this email. Please verify the OTP or request for a new one.",
      });
      return;
    }
    await redisClient.hSet(`pending_user:${email}`, {
      firstname,
      lastname,
      state,
      email,
      password: hashedPassword,
      otp: OTP,
      createdAt: new Date().toISOString(),
    });
    await redisClient.expire(`pending_user:${email}`, otpExpiry);

    // Reset user attempts on successful registration
    await redisClient.del(`pending_user_attempts:${email}`);

    const result = await sendOTPEmail(
      email as string,
      OTP,
      "Your one-time Email verification code is:",
    );

    res.status(HttpStatus.Created).json({
      status: "success",
      message: "email sent",
    });
  },
);

export default registerUser;
