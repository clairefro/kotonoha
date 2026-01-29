import { Request, Response, NextFunction } from "express";
import { SessionUser } from "shared-types";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.session && req.session.user as SessionUser | undefined;
  if (user && user.is_admin) {
    return next();
  }
  return res.status(403).json({ message: "Admin access required" });
}
