import { generateOtp } from "@auth/utils/generateOtp";
import {
  checkUserExistingCache,
  updateUserCacheOtp,
} from "@auth/utils/redisHandling";
import { HttpStatus } from "@common/enums/StatusCodes";
import { AppError } from "@common/errors/appErrors";
import { sendOTPEmail } from "@common/utils/sendEmail";
import { validateEmail } from "@auth/models/token";

export const updateRegisterOtpService = async (input: { email: string }) => {
  const { error, value } = validateEmail(input);
  if (error) {
    throw new AppError(
      "Bad request",
      HttpStatus.BadRequest,
      error.details[0].message,
    );
  }

  const existingCache = await checkUserExistingCache(value.email);
  if (!existingCache) {
    throw new AppError(
      "User detalis not found",
      HttpStatus.NotFound
    );
  }

  const OTP = await generateOtp();

  const result = await sendOTPEmail(
    value.email,
    OTP,
    "Your one-time Email verification code is:",
  );

  if (!result) {
    throw new AppError(
      "Failed to send OTP email. Please try again later.",
      HttpStatus.ServerError,
    );
  }

  await updateUserCacheOtp(value.email, OTP);
};
