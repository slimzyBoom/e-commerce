import jwt from "jsonwebtoken";
import { Types } from "mongoose";

export interface AccessTokenPayload {
  id: Types.ObjectId;
  roles: number[];
}

export const generateAccessToken = (
  userId: Types.ObjectId,
  roles: { Admin?: number; User: number },
): string => {
  const secret = process.env.ACCESS_TOKEN_SECRET as string;

  const roleArray = Object.values(roles).filter((role) : role is number => Boolean(role));
  const tokenPayload: AccessTokenPayload = {
    id: userId,
    roles: roleArray
  }

  return jwt.sign(
    tokenPayload,
    secret,
    { expiresIn: "15m" },
  );
};
