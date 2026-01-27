/// <reference path="../../../../types/express-session.d.ts" />

import { Response } from "express";
import { BaseRouter } from "./_BaseRouter";
import { createId, hashPassword } from "../utils/db-utils";
import { UsersEmptyResponse, User } from "shared-types";

export class UsersRouter extends BaseRouter {
  constructor(private db: any) {
    super("users");
  }

  protected defineRoutes() {
    // Get all users (no passwords)
    this.router.get("/", async (req, res: Response<User[]>, next) => {
      try {
        const result = await this.db.execute(
          "SELECT id, username, is_admin, created_at FROM users",
        );

        const users = (result.rows as any[]).map((row) => ({
          id: row.id,
          username: row.username,
          is_admin: row.is_admin,
          created_at: row.created_at,
        }));

        res.json(users);
      } catch (err) {
        next(err);
      }
    });

    // Check if users table is empty
    this.router.get(
      "/empty",
      async (req, res: Response<UsersEmptyResponse>, next) => {
        try {
          const result = await this.db.execute(
            "SELECT COUNT(*) as count FROM users",
          );
          const isEmpty = Number(result.rows[0]?.count) === 0;
          res.json({ empty: isEmpty });
        } catch (err) {
          next(err);
        }
      },
    );

    // Create a new user (admin only, except first user)
    this.router.post("/", async (req, res: Response<User>, next) => {
      const { username, password } = req.body;
      if (!username || !password) {
        return next({ status: 400, message: "Missing username or password" });
      }
      const id = createId.user();
      try {
        // Check user count
        const countResult = await this.db.execute(
          "SELECT COUNT(*) as count FROM users",
        );
        let userCount = Number(countResult.rows[0]?.count) || 0;
        let is_admin = 0;
        if (userCount === 0) {
          // First user: always admin
          is_admin = 1;
          // Double-check right before insert to avoid race condition
          const doubleCheck = await this.db.execute(
            "SELECT COUNT(*) as count FROM users",
          );
          userCount = Number(doubleCheck.rows[0]?.count || 0);
          if (userCount !== 0) {
            return next({
              status: 409,
              message:
                "Too late! An admin already exists. Only admins can create new users",
            });
          }
        } else {
          // Only admins can create users
          const sessionUser = req.session?.user;
          if (!sessionUser) {
            return next({
              status: 403,
              message:
                "Only admins can create users. If you are seeing this in the admin onboarding, it means someone else already created an admin",
            });
          }
          // Fetch user from DB to check is_admin
          const adminCheck = await this.db.execute(
            "SELECT is_admin FROM users WHERE id = ?",
            [sessionUser.id],
          );
          if (!adminCheck.rows[0]?.is_admin) {
            return next({
              status: 403,
              message: "Only admins can create users",
            });
          }
        }
        const password_hash = await hashPassword(password);
        await this.db.execute(
          `INSERT INTO users (id, username, password_hash, is_admin) VALUES (?, ?, ?, ?)`,
          [id, username, password_hash, is_admin],
        );
        const user = { id, username };
        res.status(201).json(user);
      } catch (err) {
        next(err);
      }
    });

    // Get a single user (no password)
    this.router.get("/:id", async (req, res: Response<User>, next) => {
      try {
        const result = await this.db.execute(
          "SELECT id, username, is_admin, created_at FROM users WHERE id = ?",
          [req.params.id],
        );
        const row = result.rows[0];
        if (!row) return next({ status: 404, message: "User not found" });
        const user: User = {
          id: row.id,
          username: row.username,
          is_admin: row.is_admin,
          created_at: row.created_at,
        };
        res.json(user);
      } catch (err) {
        next(err);
      }
    });
  }
}
