/// <reference path="../../../../types/express-session.d.ts" />

import { verifyPassword } from "../utils/db-utils";
import { BaseRouter } from "./_BaseRouter";
import { User, SessionUser, OkResponse } from "shared-types";
import { Response } from "express";

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
      async (req, res: Response<SessionUser>, next) => {
        const { username, password } = req.body;
        if (!username || !password) {
          return next({ status: 400, message: "Missing username or password" });
        }
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
