import { validateRegisterInput, User } from "@auth/models/User.js";
import { hashPassword } from "@auth/utils/hashPassword.js";
import { generateOtp } from "@auth/utils/generateOtp.js";
import { sendOTPEmail } from "@common/utils/sendEmail.js";
import { HttpStatus } from "@common/enums/StatusCodes.js";
import { AppError } from "@common/errors/appErrors.js";
import {
  checkUserExistingCache,
  cacheUserData,
} from "@auth/utils/redisHandling.js";

interface IRegisterInput {
  firstname: string;
  lastname: string;
  state: string;
  email: string;
  password: string;
}

export const registerUserService = async (input: IRegisterInput) => {
  const { error } = validateRegisterInput(input);
  if (error) {
    const errorDetails = error.details[0].message;
    throw new AppError("Bad Request", HttpStatus.BadRequest, errorDetails);
  }

  const { firstname, lastname, state, email, password } = input;

  const duplicate = await User.findOne({ email }).lean().exec();

  if (duplicate) {
    throw new AppError("User with email already exists", HttpStatus.Conflict);
  }

  const existingCache = await checkUserExistingCache(email);
  if (existingCache) {
    throw new AppError(
      "An OTP has already been sent to this email. Please verify the OTP or request for a new one.",
      HttpStatus.Conflict,
    );
  }

  const OTP = await generateOtp();
  const hashedPassword = await hashPassword(password);

  const result = await sendOTPEmail(
    email as string,
    OTP,
    "Your one-time Email verification code is:",
  );

  if (!result) {
    throw new AppError(
      "Failed to send OTP email. Please try again later.",
      HttpStatus.ServerError,
    );
  }

  await cacheUserData({
    email,
    firstname,
    lastname,
    state,
    otp: OTP,
    password: hashedPassword,
  });
};
