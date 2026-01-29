import { ZodType } from "zod";
import { Request, Response, NextFunction } from "express";

export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next({
        status: 400,
        message:
          "Invalid request (body). " +
          result.error.issues.map((i) => i.message).join("; "),
      });
    }
    req.body = result.data; // type-safe!
    next();
  };
}

export function validateParams(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return next({
        status: 400,
        message:
          "Invalid request (params). " +
          result.error.issues.map((i) => i.message).join("; "),
      });
    }
    next();
  };
}
