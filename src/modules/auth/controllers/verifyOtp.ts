import { Request, Response } from "express";
import { HttpStatus } from "../../common/enums/StatusCodes.js";
import { verifyRegisterOtpService } from "@auth/services/verifyRegisterOtp.service.js";
import { setTokens } from "../../auth/utils/tokenGenerator.js";
import expressAsyncHandler from "express-async-handler";

export const verifyOtp = expressAsyncHandler(async (req : Request, res : Response) => {
  const { accessToken, refreshToken, userId } = await verifyRegisterOtpService(req.body);
  await setTokens(res, refreshToken);
    res.status(HttpStatus.Success).json({
      status: "Success",
      message: "email verified and user registered",
      data: {
        accessToken,
        userId,
      },
    });
})



