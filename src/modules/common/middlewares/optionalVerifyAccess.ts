// src/modules/common/middlewares/optionalVerifyAccess.ts
import { Request, Response, NextFunction } from "express";
import verifyToken from "../utils/verifyToken.js";
import { logger } from "@common/service/logger.js"

export const optionalVerifyAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const HEADER = req.headers.authorization || req.headers.Authorization;
  if (!HEADER || typeof HEADER !== "string" || !HEADER.startsWith("Bearer ")) {
    return next();
  }

  try {
    const decodedToken = await verifyToken(HEADER.split(" ")[1]);
    req.user = { id: decodedToken.id, roles: decodedToken.roles };
  } catch (error) {
    if (error instanceof Error) {
      logger.warn({ action: "otpional verify access" }, `Token verification failed proceeding with request`);
    }
  }

  return next();
}
