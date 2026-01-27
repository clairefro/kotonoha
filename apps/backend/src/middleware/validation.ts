import { ZodType } from "zod";
import { Request, Response, NextFunction } from "express";

export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next({
        status: 400,
        message:
          "Invalid request. " +
          result.error.issues.map((i) => i.message).join("; "),
      });
    }
    req.body = result.data; // type-safe!
    next();
  };
}
