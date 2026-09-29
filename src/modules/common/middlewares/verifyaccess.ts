import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../../common/enums/StatusCodes.js";
import { Roles } from "@common/enums/roles.js";
import verifyToken from "../../common/utils/verifyToken.js";
import { logger } from "@common/service/logger.js";
import { AppError } from "@common/errors/appErrors.js";
import { normalizeRoles } from "@common/utils/sanitizeInput.js";

const verifyUserAcces = (requiredRoles = [Roles.User, Roles.Admin]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    console.log("Verify user access called...")
    const HEADER = req.headers.authorization;

    if (typeof HEADER !== "string" || !HEADER.startsWith("Bearer ")) {
      throw new AppError("No token provided", HttpStatus.Unauthorized);
    }

    const token = HEADER.split(" ")[1];

    let decodedToken: Express.User;

    try {
      decodedToken = await verifyToken(token);
      console.log("Token vwerified...")
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "TokenExpiredError") {
          throw new AppError("Token expired", HttpStatus.Unauthorized);
        } 
        throw new AppError(
          `Forbidden : ${error.message}`,
          HttpStatus.Forbiddden,
        );
      }
      throw new AppError("An unknown error occurred", HttpStatus.Forbiddden);
    }

    const { id: userId, roles } = decodedToken;
    const normalizedRoles = normalizeRoles(roles);

    if (!userId) {
      throw new AppError("Invalid user", HttpStatus.Unauthorized);
    }

    const hasAccess = requiredRoles.some((role) =>
      normalizedRoles.includes(role),
    );

    if (!hasAccess) {
      logger.warn(
        { action: "verify user access" },
        "User does not have sufficient role for access",
      );
      throw new AppError("Insufficient role privileges", HttpStatus.Forbiddden);
    }
      req.user = { id: userId, roles: normalizedRoles };

    return next();
  };
};

export default verifyUserAcces;
