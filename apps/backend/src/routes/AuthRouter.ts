/// <reference path="../../../../types/express-session.d.ts" />

import { Response, Request, NextFunction } from "express";
import { verifyPassword } from "../utils/db-utils";
import { BaseRouter } from "./_BaseRouter";
import { User, SessionUser, OkResponse } from "shared-types";
import { LoginRequest, LoginRequestSchema } from "shared-types/validation/auth";
import { validateBody } from "../middleware/validation";

interface UserRaw extends User {
  password_hash: string;
}

export class AuthRoute extends BaseRouter {
  constructor(private db: any) {
    super("auth");
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
          // Fetch user by username
          const result = await this.db.execute(
            "SELECT id, username, password_hash FROM users WHERE username = ?",
            [username],
          );
          const user = result.rows[0] as UserRaw | undefined;
          if (!user) {
            return next({ status: 401, message: "Invalid credentials" });
          }
          // Compare password with hash
          const match = await verifyPassword(password, user.password_hash);
          if (!match) {
            return next({ status: 401, message: "Invalid credentials" });
          }
          // Explicitly construct SessionUser to ensure password_hash is not present
          const sessionUser: SessionUser = {
            id: user.id,
            username: user.username,
            is_admin: user.is_admin,
          };
          req.session.user = sessionUser;
          res.json(sessionUser);
        } catch (err) {
          next(err);
        }
      },
    );

    // GET /api/auth/session
    this.router.get("/session", (req, res: Response<SessionUser>, next) => {
      try {
        if (req.session.user) {
          res.json(req.session.user);
        } else {
          next({ status: 401, message: "Not authenticated" });
        }
      } catch (err) {
        next(err);
      }
    });

    // POST /api/auth/logout
    this.router.post("/logout", (req, res: Response<OkResponse>, next) => {
      req.session.destroy((err) => {
        if (err) return next(err);
        res.json({ ok: true });
      });
    });
  }
}
