import type { Request, Response, NextFunction } from "express";

/**
 * Standard error-handling middleware for Express.
 * Returns { error: string } with appropriate status code.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const status = err.status || 500;
  const message = err.message || "Server error";
  res.status(status).json({ error: message });
}
