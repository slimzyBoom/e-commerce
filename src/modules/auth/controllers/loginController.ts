import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { HttpStatus } from "../../common/enums/StatusCodes.js";
import { setTokens } from "../../auth/utils/tokenGenerator.js";
import { loginUserService } from "@auth/services/login.service.js";

const loginUser = expressAsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const guestId = req.cookies?.guest_id;
    const loginResult = await loginUserService(req.body, guestId);
    res.clearCookie("guest_id", {
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    })

    await setTokens(res, loginResult.refreshToken);

    res.status(HttpStatus.Success).json({
      status: "Success",
      message: "Operation successful",
      data: {
        accessToken : loginResult.accessToken
      },
    });
    req.log.info({
      message: "User logged in"
    })
  },
);

export default loginUser;
