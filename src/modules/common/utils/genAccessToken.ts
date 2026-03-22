import jwt from "jsonwebtoken";
import { Types } from "mongoose";

export const generateAccessToken = (
  userId: Types.ObjectId,
  roles: { Admin?: number; User?: number }
): string => {
  const secret = process.env.ACCESS_TOKEN_SECRET as string;

  const roleArray = Object.entries(roles)
    .filter(([_, value]) => value)
    .map(([key]) => key);

  return jwt.sign(
    {
      userInfo: {
        id: userId,
        roles: roleArray,
      },
    },
    secret,
    { expiresIn: "15m" }
  );
};
