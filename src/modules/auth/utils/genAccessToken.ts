import jwt from "jsonwebtoken";
import { IRequestUser } from "modules/interfaces/User";
import { Types } from "mongoose";

export const generateAccessToken = (
  userId: Types.ObjectId,
  roles: { Admin?: number; User: number },
): string => {
  const secret = process.env.ACCESS_TOKEN_SECRET as string;

  const roleArray = Object.values(roles).filter((role) : role is number => Boolean(role));
  const tokenPayload: IRequestUser = {
    id: userId,
    roles: roleArray
  }

  return jwt.sign(
    tokenPayload,
    secret,
    { expiresIn: "15m" },
  );
};
