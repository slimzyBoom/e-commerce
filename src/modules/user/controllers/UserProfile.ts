import { User } from "../../auth/models/User.js";
import { HttpStatus } from "../../common/enums/StatusCodes.js";
import { Request, Response } from "express";
import { AppError } from "@common/errors/appErrors.js";
import expressAsyncHandler from "express-async-handler";

export const getUserProfile = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const userProfile = await User.findById(userId).select(
      "-password -refreshToken -provider -_id -roles -provider -__v",
    );
    
    if (!userProfile) {
      throw new AppError("User not found", HttpStatus.NotFound);
    }

    res.status(HttpStatus.Success).json({
      status: "success",
      data: userProfile,
      statusCode: HttpStatus.Success,
    });
  },
);
