import { Request, Response } from "express";
import { User, validatePasswordMatchInput } from "../models/User.js";
import { HttpStatus } from "../../common/enums/StatusCodes.js";
import { validatePassword } from "../../common/utils/validatePassword.js";
import { hashPassword } from "../utils/hashPassword.js";
import { AppError } from "@common/errors/appErrors.js"
import expressAsyncHandler from "express-async-handler";


const changePassword = expressAsyncHandler(async (
  req: Request,
  res: Response,
): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", HttpStatus.Unauthorized)
    }

    const user = await User.findById(userId).exec();
    if (!user) {
      throw new AppError("Not found", HttpStatus.NotFound)
    }

    if (!user.password || (user.provider?.includes("google"))) {
      throw new AppError("Conflict for user", HttpStatus.Conflict)
    }

    const { error, value } = validatePasswordMatchInput(req.body);
    if(error){
      throw new AppError("Bad request", HttpStatus.BadRequest, error.details[0].message)
    }

    // Validate old password
    const isMatch = await validatePassword(value.oldPassword, user.password);
    if (!isMatch) {
      throw new AppError("Password does nto match", HttpStatus.BadRequest)
    }

    // Ensure new password is not the same as the old one
    const isNewPasswordSame = await validatePassword(
      value.newPassword,
      user.password,
    );
    if (isNewPasswordSame) {
      throw new AppError("Bad request", HttpStatus.BadRequest)
    }

    // Hash the new password and save it
    const hashedNewPassword = await hashPassword(value.newPassword);
    user.password = hashedNewPassword;
    await user.save();

    res.status(HttpStatus.Success).json({
      status: "success",
      message: "Password updated successfully",
    });
})

export default changePassword;
