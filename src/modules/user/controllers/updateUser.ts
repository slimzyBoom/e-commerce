import { HttpStatus } from "./../../common/enums/StatusCodes";
import { Request, Response } from "express";
import { User } from "../../auth/models/User";
import { validateUpdateProfileInput } from "../../user/model/Updateuser";
import { AppError } from "@common/errors/appErrors";
import { logger } from "@common/service/logger";
import expressAsyncHandler from "express-async-handler";
import { hashPassword } from "@auth/utils/hashPassword";

export const updateUserProfile = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // Check if user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      logger.error("Unauthorized access to user profile");
      throw new AppError("Unauthorized", HttpStatus.Unauthorized);
    }

    // Validate input
    const { error, value } = validateUpdateProfileInput(req.body);
    if (error) {
      throw new AppError(
        "Bad request",
        HttpStatus.BadRequest,
        error.details[0].message,
      );
    }

    await User.findByIdAndUpdate(
      userId,
      { $set: value },
      { runValidators: true },
    ).select("-password -refreshToken -roles -googleId -provider");

    res.status(HttpStatus.Success).json({
      status: "success",
      message: "Profile updated successfully",
    });
  },
);
