import { User } from "../../auth/models/User";
import { HttpStatus } from "../../common/enums/StatusCodes";
import { Request, Response } from "express";
import { AppError } from "@common/errors/appErrors";
import { logger } from "@common/service/logger";
import expressAsyncHandler from "express-async-handler";

export const getUserProfile = expressAsyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      logger.error("Unauthorized access to user profile");
      throw new AppError("Unauthorized", HttpStatus.Unauthorized);
    }

    const userProfile = await User.findById(req.user.id).select(
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
