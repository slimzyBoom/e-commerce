import { Request, Response } from "express";
import { HttpStatus } from "../../common/enums/StatusCodes";
import { User, validateOtpInput } from "../models/User";
import { redisClient } from "../../common/config/redisClient";
import { generateAccessToken } from "../../common/utils/genAccessToken";
import { generateRefreshToken } from "../../common/utils/genRefreshToken";
import { setTokens } from "../../auth/utils/tokenGenerator";

import { IUser } from "modules/interfaces/User";
const maxAttempts = process.env.OTP_ATTEMPTS
  ? parseInt(process.env.OTP_ATTEMPTS, 10)
  : 5;
// import NodeCache from "node-cache";

// const cache = new NodeCache({ stdTTL: 0 });

const verifyOtp = async (
  req: Request<{}, {}, { otp: string; email: string }>,
  res: Response
): Promise<Response | undefined> => {
  try {
    const { otp, email } = req.body;
    const { error } = validateOtpInput({ otp, email });

    if (error) {
      return res.status(HttpStatus.BadRequest).json({
        status: "Bad request",
        message: error.details[0].message,
        statusCode: HttpStatus.BadRequest,
      });
    }

    const pendingKey = `pending_user:${email}`;
    const attemptsKey = `pending_user_attempts:${email}`;

    const userData = await redisClient.hGetAll(pendingKey);

    // Check if redis still have the user data
    if (!userData || Object.keys(userData).length === 0) {
      return res.status(HttpStatus.BadRequest).json({
        status: "Bad request",
        message: "OTP has expired.",
        statusCode: HttpStatus.BadRequest,
      });
    }

    const currentAttemptsString = await redisClient.get(attemptsKey);

    const currentAttempts = currentAttemptsString
      ? parseInt(currentAttemptsString, 10)
      : 0;

    if (currentAttempts >= maxAttempts) {
      await redisClient.del(pendingKey);
      await redisClient.del(attemptsKey);
      return res.status(HttpStatus.BadRequest).json({
        status: "Bad request",
        message: "Maximum OTP attempts exceeded. Please register again.",
        statusCode: HttpStatus.BadRequest,
      });
    }

    if (userData.otp !== otp) {
      await redisClient.incr(attemptsKey);
      const ttl = await redisClient.ttl(pendingKey);
      await redisClient.expire(attemptsKey, ttl);

      return res.status(HttpStatus.BadRequest).json({
        status: "Bad request",
        message: "OTP does not match",
        statusCode: HttpStatus.BadRequest,
      });
    }

    // OTP matched — before creating, ensure user does not already exist
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      // cleanup pending redis keys
      await redisClient.del(pendingKey);
      await redisClient.del(attemptsKey);
      return res.status(HttpStatus.Conflict).json({
        status: "Conflict",
        message: "User already exists with this email.",
        statusCode: HttpStatus.Conflict,
      });
    }

    const newUser = await User.create({
      firstname: userData.firstname,
      lastname: userData.lastname,
      state: userData.state,
      email: userData.email,
      password: userData.password,
    });

    await redisClient.del(pendingKey);
    await redisClient.del(attemptsKey);

    const accessToken = generateAccessToken(newUser._id, newUser.roles);
    const refreshToken = generateRefreshToken(newUser._id);
    newUser.refreshToken = refreshToken;

    await newUser.save();
    await setTokens(res, refreshToken);
    res.status(HttpStatus.Success).json({
      status: "Success",
      message: "email verified and user registered",
      data: {
        accessToken,
        user: { userId: newUser._id },
      },
    });
  } catch (error) {
    return res.status(HttpStatus.ServerError).json({
      status: "Bad request",
      message: "Internal server error",
      error: `${error} error`,
      statusCode: "500",
    });
  }
};
export default verifyOtp;
