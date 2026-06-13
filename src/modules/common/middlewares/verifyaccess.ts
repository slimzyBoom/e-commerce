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
    const HEADER = req.headers.authorization || req.headers.Authorization;

    if (typeof HEADER !== "string" || !HEADER.startsWith("Bearer ")) {
      throw new AppError("No token provided", HttpStatus.Unauthorized);
    }

    const token = HEADER.split(" ")[1];
<<<<<<< Updated upstream
    let decodedToken: Express.User;
=======
<<<<<<< Updated upstream
    let decodedToken;
>>>>>>> Stashed changes

    try {
      decodedToken = await verifyToken(token);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "TokenExpiredError") {
          throw new AppError("Token expired", HttpStatus.Unauthorized);
        } else if (error.name === "JsonWebTokenError") {
          throw new AppError("Invalid token", HttpStatus.Forbiddden);
        }
        throw new AppError(
          `Forbidden : ${error.message}`,
          HttpStatus.Forbiddden,
        );
      }
      throw new AppError("An unknown error occurred", HttpStatus.Forbiddden);
    }

<<<<<<< Updated upstream
    const { id: userId, roles } = decodedToken;
    const normalizedRoles = normalizeRoles(roles);
=======
    const userId = decodedToken?.id;
    const roles = decodedToken?.roles;
=======

    try {
      const decodedToken: Express.User = await verifyToken(token);
      const { id: userId, roles } = decodedToken;
    const normalizedRoles = normalizeRoles(roles);
>>>>>>> Stashed changes
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
    req.user = { id: userId, roles: normalizedRoles };
=======
<<<<<<< Updated upstream
    req.user = { id: userId, roles };
=======
    req.user = { id: userId, roles: normalizedRoles };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "TokenExpiredError") {
          throw new AppError("Token expired", HttpStatus.Unauthorized);
        } else if (error.name === "JsonWebTokenError") {
          throw new AppError("Invalid token", HttpStatus.Forbiddden);
        }
        throw new AppError(
          `Forbidden : ${error.message}`,
          HttpStatus.Forbiddden,
        );
      }
      throw new AppError("An unknown error occurred", HttpStatus.Forbiddden);
    }
>>>>>>> Stashed changes
>>>>>>> Stashed changes

    return next();
  };
};

export default verifyUserAcces;
