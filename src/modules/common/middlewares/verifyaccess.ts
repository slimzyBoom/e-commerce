import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../../common/enums/StatusCodes";
import { Roles } from "@common/enums/roles";
import verifyToken from "../../common/utils/verifyToken";
import { IRequestUser } from "modules/interfaces/User";
import { AppError } from "@common/errors/appErrors";

const verifyUserAcces = (requiredRoles = [Roles.User, Roles.Admin]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const HEADER = req.headers.authorization || req.headers.Authorization;

    if (typeof HEADER !== "string" || !HEADER.startsWith("Bearer ")) {
      return res
        .status(HttpStatus.Unauthorized)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = HEADER.split(" ")[1];
    let decodedToken : IRequestUser;

    try {
      decodedToken = await verifyToken(token);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "TokenExpiredError") {
          return res
            .status(HttpStatus.Unauthorized)
            .json({ message: "Token expired" });
        } else if (error.name === "JsonWebTokenError") {
          return res
            .status(HttpStatus.Forbiddden)
            .json({ message: "Invalid token" });
        }
        return res
          .status(HttpStatus.Forbiddden)
          .json({ message: `Forbidden: ${error.message}` });
      }
      return res
        .status(HttpStatus.Forbiddden)
        .json({ message: "An unknown error occurred" });
    }

    const userId = decodedToken?.id;
    const roles = decodedToken?.roles;

    if (!userId) {
      return res
        .status(HttpStatus.Unauthorized)
        .json({ message: "Unauthorized: Invalid user" });
    }

    const hasAccess = requiredRoles.some((role) => roles.includes(role));

    if (!hasAccess) {
      return res
        .status(HttpStatus.Forbiddden)
        .json({ message: "Forbiddden: Insufficient role privileges" });
    }

    req.user = { id: userId, roles };

   return next()
  };
};

export default verifyUserAcces;
