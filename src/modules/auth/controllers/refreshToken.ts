import { User } from "../models/User.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";
import { HttpStatus } from "../../common/enums/StatusCodes.js";
import { generateAccessToken } from "../utils/genAccessToken.js";

export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  const cookies = req.cookies;

  if (!cookies?.refreshToken) {
    return res
      .status(HttpStatus.Unauthorized)
      .json({ message: "Unauthorized: No refresh token provided" });
  }

  const refreshToken = cookies.refreshToken;
  console.log(req.headers.cookie);
  console.log(req.cookies);

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as string,
    async (err: Error | null, decoded: JwtPayload | string | undefined) => {
      if (err) {
        if (err instanceof jwt.TokenExpiredError) {
          return res
            .status(HttpStatus.Unauthorized)
            .json({ message: "Token expired" });
        }
        return res
          .status(HttpStatus.Forbiddden)
          .json({ message: "Forbidden: Invalid token" });
      }

      // Check if decoded is a JwtPayload (an object), not a string
      if (
        typeof decoded !== "object" ||
        !decoded ||
        !(decoded as JwtPayload).id
      ) {
        return res
          .status(HttpStatus.Unauthorized)
          .json({ message: "Unauthorized: Invalid token data" });
      }

      const userId = (decoded as JwtPayload).id;

      const foundUser = await User.findOne({ _id: userId })
        .select("+refreshToken")
        .exec();

      if (!foundUser) {
        return res
          .status(HttpStatus.Unauthorized)
          .json({ message: "Unauthorized: User not found" });
      }

      // console.log("Cookie:", refreshToken);
      // console.log("Mongo :", foundUser.refreshToken);
      // console.log("Equal :", refreshToken === foundUser.refreshToken);

      if (foundUser.refreshToken !== refreshToken) {
        return res
          .status(HttpStatus.Forbiddden)
          .json({ message: "Forbidden: Refresh token mismatch" });
      }

      const accessToken = generateAccessToken(foundUser._id, foundUser.roles);

      return res.json({ accessToken });
    },
  );
};
