/// <reference path="../../../../types/express-session.d.ts" />

import { Response, Request, NextFunction } from "express";
import { verifyPassword } from "../utils/db-utils";
import { UserService } from "../services/UserService";
import { BaseRouter } from "./_BaseRouter";
import { User, SessionUser, OkResponse } from "shared-types";
import { LoginRequest, LoginRequestSchema } from "shared-types/validation/auth";
import { validateBody } from "../middleware/validation";

interface UserRaw extends User {
  password_hash: string;
}

export class AuthRoute extends BaseRouter {
  private userService: UserService;
  constructor(db: any) {
    super("auth");
    this.userService = new UserService(db);
  }

  protected defineRoutes() {
    // POST /api/auth/login
    this.router.post(
      "/login",
      validateBody(LoginRequestSchema),
      async (
        req: Request<{}, {}, LoginRequest>,
        res: Response<SessionUser>,
        next: NextFunction,
      ) => {
        const { username, password } = req.body;
        try {
          // Fetch user by username (assume username is email for compatibility)
          const user = await this.userService.getUserByEmail(username);
          if (!user) {
            return next({ status: 401, message: "Invalid credentials" });
          }
          // Compare password with hash
          const match = await verifyPassword(password, user.password);
          if (!match) {
            return next({ status: 401, message: "Invalid credentials" });
          }
          // Explicitly construct SessionUser to ensure password is not present
          const sessionUser: SessionUser = {
            id: user.id,
            username: user.email || user.name || username,
            is_admin: user.role === "admin" || !!user.is_admin,
          };
          req.session.user = sessionUser;
          res.json(sessionUser);
        } catch (err) {
          next(err);
        }
      },
    );

    // GET /api/auth/session
    this.router.get(
      "/session",
      async (req, res: Response<SessionUser>, next) => {
        try {
          if (req.session.user) {
            // Always fetch is_admin from DB/service to ensure it's up to date
            const user = await this.userService.getUserById(
              req.session.user.id,
            );
            const is_admin = user?.role === "admin" || !!user?.is_admin;
            res.json({ ...req.session.user, is_admin });
          } else {
            next({ status: 401, message: "Not authenticated" });
          }
        } catch (err) {
          next(err);
        }
      },
    );

    // POST /api/auth/logout
    this.router.post("/logout", (req, res: Response<OkResponse>, next) => {
      req.session.destroy((err) => {
        if (err) return next(err);
        res.json({ ok: true });
      });
    });
  }
}
