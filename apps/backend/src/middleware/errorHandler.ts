import type { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "shared-types";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const status = err.status || 500;
  const message = err.message || "Serer error";
  const response: ErrorResponse = { status, message };
  res.status(status).json(response);
}
