import jwt from "jsonwebtoken";
import { Types } from "mongoose";

export const generateRefreshToken = (userId: Types.ObjectId): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET as string;
  return jwt.sign({ id: userId }, secret, { expiresIn: "2d" });
};
