import { AppError } from "@common/errors/appErrors.js";
import { HttpStatus } from "@common/enums/StatusCodes.js";
import { validateLoginInput, User } from "@auth/models/User.js";
import { validatePassword } from "@common/utils/validatePassword.js";
import { generateAccessToken } from "@auth/utils/genAccessToken.js";
import { generateRefreshToken } from "@auth/utils/genRefreshToken.js";
import { mergeGuestCartIntoUserCart } from "modules/cart/utils/genOrMergeCart.js";
interface ILoginInput {
  email: string;
  password: string;
}

interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
}

export const loginUserService = async (
  input: ILoginInput,
  guestId: string
): Promise<ILoginResponse> => {
  const { error } = validateLoginInput(input);
  if (error) {
    throw new AppError(
      "Bad Request",
      HttpStatus.BadRequest,
      error.details[0].message,
    );
  }
  const { email, password } = input;

  const user = await User.findOne({ email }).select("+password").exec();
  if (!user) {
    throw new AppError(
      "Bad Request",
      HttpStatus.BadRequest,
      "User is not found",
    );
  }
  if (!user.password) {
    throw new AppError(
      "Bad Request",
      HttpStatus.BadRequest,
      "This account is registered using Google. Please log in with Google.",
    );
  }

  const checkPassword = await validatePassword(
    password,
    user.password,
  );
  if (!checkPassword) {
    throw new AppError(
      "Bad Request",
      HttpStatus.BadRequest,
      "Password Incorrect",
    );
  }

  await mergeGuestCartIntoUserCart(guestId, user._id)

  const accessToken = generateAccessToken(user._id, user.roles);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;

  await user.save();
  return { accessToken, refreshToken };
};
