import { validateOtpInput } from "@auth/models/User.js";
import { HttpStatus } from "@common/enums/StatusCodes.js";
import { AppError } from "@common/errors/appErrors.js";
import { generateAccessToken } from "@auth/utils/genAccessToken.js";
import { generateRefreshToken } from "@auth/utils/genRefreshToken.js";
import {
  checkUserExistingCache,
  getAttempts,
  deleteUserAndAttempts,
  updateAttempts,
  getUserDataFromCache,
} from "@auth/utils/redisHandling.js";
import { User } from "@auth/models/User.js";
import { logger } from "@common/service/logger.js"
import { sanitizeEmail } from "@common/utils/sanitizeInput.js";
import { mergeGuestCartIntoUserCart } from "modules/cart/utils/genOrMergeCart.js";

interface IVerifyOtpInput {
  email: string;
  otp: string;
}

const maxAttempts = process.env.OTP_ATTEMPTS
  ? parseInt(process.env.OTP_ATTEMPTS, 10)
  : 5;

export const verifyRegisterOtpService = async (userInput: IVerifyOtpInput, guestId: string) => {
  const { error } = validateOtpInput(userInput);
  if (error) {
    throw new AppError(
      "Bad Request",
      HttpStatus.BadRequest,
      error.details[0].message,
    );
  }
  const { email, otp } = userInput;
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail }).lean().exec();
  if (existing) {
    await deleteUserAndAttempts(normalizedEmail);
    throw new AppError("User with email already exists", HttpStatus.Conflict);
  }

  const existingCache = await checkUserExistingCache(normalizedEmail);

  // Check if redis still have the user data or is expired
  if (!existingCache) {
    throw new AppError("OTP has expired.", HttpStatus.BadRequest);
  }

  const currentAttempts = await getAttempts(normalizedEmail);

  // if we have exceeded max attempt we delete the pending user data and register again
  if (currentAttempts >= maxAttempts) {
    await deleteUserAndAttempts(normalizedEmail);
    throw new AppError(
      "Maximum OTP verification attempts exceeded. Please register again to receive a new OTP.",
      HttpStatus.BadRequest,
    );
  }

  const userDataFromCache = await getUserDataFromCache(normalizedEmail);

  if(!userDataFromCache){
    logger.error({ email : sanitizeEmail(email), action: "verify register otp"}, "failed to get user from cache")
    throw new AppError("Cache error", HttpStatus.ServerError)
  }

  if (userDataFromCache.otp !== otp) {
    await updateAttempts(normalizedEmail);
    throw new AppError("Invalid OTP. Please try again.", HttpStatus.BadRequest);
  }

  // OTP matched — before creating, ensure user does not already exist

  const newUser = await User.create({
    firstname: userDataFromCache.firstname,
    lastname: userDataFromCache.lastname,
    state: userDataFromCache.state,
    email: userDataFromCache.email,
    password: userDataFromCache.password,
  });

  await deleteUserAndAttempts(email);

  await mergeGuestCartIntoUserCart(guestId, newUser._id);

  const accessToken = generateAccessToken(newUser._id, newUser.roles);
  const refreshToken = generateRefreshToken(newUser._id);
  newUser.refreshToken = refreshToken;

  await newUser.save();

  return { accessToken, refreshToken, userId: newUser._id };
};
