import { NextFunction, Response, Request } from "express";
import { AppError } from "../errors/appErrors.js"
import { IResponse } from "modules/interfaces/User.js";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof Error ? err.message : "Something went wrong";

  const response: IResponse = {
    success: false,
    message: statusCode === 500 ? "Internal server error" : message,
  };

  // attach structured data if it exists
  if (err instanceof AppError && err.details) {
    if(typeof err.details === "object" && !Array.isArray(err.details)){
      Object.assign(response, err.details);
    }
    else if (typeof err.details === "string"){
      response.errors = err.details;
    }
  }

  res.status(statusCode).json(response);
};

