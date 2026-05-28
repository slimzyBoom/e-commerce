import { Request, Response } from "express";
import { User, validatePasswordInput } from "../models/User.js";
import { hashPassword } from "../utils/hashPassword.js";

import { HttpStatus } from "../../common/enums/StatusCodes.js";
import { AppError } from "@common/errors/appErrors.js";

const resetPassword = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { error, value } = validatePasswordInput(req.body)
  if(error){
    throw new AppError("Bad Request", HttpStatus.BadRequest, error.details[0].message)
  }

  const user = await User.findOne({ email: value.email });
  if (!user) {
    throw new AppError("Email not found", HttpStatus.NotFound)
  }

  user.password = await hashPassword(value.password);
  await user.save();

  return res.status(HttpStatus.Success).json({
    status: "Success",
    message: "Password has been reset successfully",
  });
};

export default resetPassword;
