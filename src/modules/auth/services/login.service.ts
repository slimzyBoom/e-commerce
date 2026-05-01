import { AppError } from "@common/errors/appErrors";
import { HttpStatus } from "@common/enums/StatusCodes";
import { validateLoginInput, User } from "@auth/models/User";
import { validatePassword } from "@common/utils/validatePassword";
import { generateAccessToken } from "@auth/utils/genAccessToken";
import { generateRefreshToken } from "@auth/utils/genRefreshToken";
import { Types } from "mongoose";

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

  const user = await User.findOne({ email }).exec();
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

  const accessToken = generateAccessToken(user._id, user.roles);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;

  await user.save();
  return { accessToken, refreshToken };
};
