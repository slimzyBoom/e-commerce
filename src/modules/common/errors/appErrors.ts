import { HttpStatus } from "@common/enums/StatusCodes.js";
export class AppError extends Error {
  public statusCode: number;
  public details?: unknown;     // extra payload (validation errors etc.)
  public isOperational: boolean;

  constructor(message: string, statusCode: HttpStatus = 500, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
