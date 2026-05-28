import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { HttpStatus } from "../../common/enums/StatusCodes.js";
import { registerUserService } from "@auth/services/register.service.js";
import "../../interfaces/session.js";

const registerUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await registerUserService(req.body);

    res.status(HttpStatus.Created).json({
      status: "success",
      message: "email sent",
    });
  },
);

export default registerUser;
