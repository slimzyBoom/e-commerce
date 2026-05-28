import { HttpStatus } from "./../../common/enums/StatusCodes.js";
import { Request, Response } from "express";
import { User } from "../../auth/models/User.js";
import { validateUpdateProfileInput } from "../../user/model/Updateuser.js";
import { AppError } from "@common/errors/appErrors.js";
import expressAsyncHandler from "express-async-handler";
import { hashPassword } from "@auth/utils/hashPassword.js";
import { uploadAvatar } from "@common/uploads/avatarUpload.js";
import { IUser } from "@interfaces/User.js";


export const updateUserProfile = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const { error, value } =
      validateUpdateProfileInput(req.body);

    if (error) {
      throw new AppError(
        "Bad request",
        HttpStatus.BadRequest,
        error.details[0].message
      );
    }

    const updateData: Partial<IUser> = {
      ...value,
    };

    // Hash password if provided
    if (value.password) {
      updateData.password =
        await hashPassword(value.password);
    }

    // Handle avatar upload
    if (req.file) {
      const { buffer } = req.file;

      const uploadResult =
        await uploadAvatar(buffer);

      updateData.profile = {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
      };
    }

    await User.findByIdAndUpdate(
      userId,
      {
        $set: updateData,
      },
      {
        runValidators: true,
      }
    );

    res.status(HttpStatus.Success).json({
      status: "success",
      message: "Profile updated successfully",
    });
  }
);