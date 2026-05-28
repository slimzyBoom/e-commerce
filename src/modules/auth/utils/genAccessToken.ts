import jwt from "jsonwebtoken";
import { IRequestUser } from "modules/interfaces/User.js";
import { Types } from "mongoose";

export const generateAccessToken = (
  userId: Types.ObjectId,
  roles: Express.User["roles"],
): string => {
  const secret = process.env.ACCESS_TOKEN_SECRET as string;
  let rolesArray: number[] = [];
  if(typeof roles === "object") {
    rolesArray = Object.values(roles).filter((role) : role is number => Boolean(role));
   }
   rolesArray = Array.isArray(roles) ? roles : rolesArray;
  
  const tokenPayload: IRequestUser = {
    id: userId,
    roles: rolesArray
  }

  return jwt.sign(
    tokenPayload,
    secret,
    { expiresIn: "15m" },
  );
};
