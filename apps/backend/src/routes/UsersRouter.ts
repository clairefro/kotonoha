/// <reference path="../../../../types/express-session.d.ts" />

import { NextFunction, Response, Request } from "express";
import { BaseRouter } from "./_BaseRouter";
import { createId, hashPassword } from "../utils/db-utils";
import { UsersEmptyResponse, UserPublic } from "shared-types";
import { UserService } from "../services/UserService";
import {
  UserCreateRequest,
  UserCreateRequestSchema,
} from "shared-types/validation/users";
import { validateBody } from "../middleware/validation";

export class UsersRouter extends BaseRouter {
  private userService: UserService;
  constructor(db: any) {
    super("users");
    this.userService = new UserService(db);
  }

  protected defineRoutes() {
    // Get all users (no passwords)
    this.router.get(
      "/",
      async (
        req,
        res: Response<Omit<UserPublic, "is_admin" | "created_at">[]>,
        next,
      ) => {
        try {
          const users = await this.userService.getAllUsers();
          // Remove password fields if present
          const safeUsers = users.map(
            ({ password, password_hash, ...u }: any) => u,
          );
          res.json(safeUsers);
        } catch (err) {
          next(err);
        }
      },
    );

    // Check if users table is empty
    this.router.get(
      "/empty",
      async (req, res: Response<UsersEmptyResponse>, next) => {
        try {
          const users = await this.userService.getAllUsers();
          const isEmpty = users.length === 0;
          res.json({ empty: isEmpty });
        } catch (err) {
          next(err);
        }
      },
    );

    // Create a new user (admin only, except first user)
    this.router.post(
      "/",
      validateBody(UserCreateRequestSchema),
      async (
        req: Request<{}, {}, UserCreateRequest>,
        res: Response<Omit<UserPublic, "is_admin" | "created_at">>,
        next: NextFunction,
      ) => {
        const { username, password } = req.body;
        const id = createId.user();
        try {
          // Check user count
          const users = await this.userService.getAllUsers();
          let userCount = users.length;
          let is_admin = false;
          if (userCount === 0) {
            // First user: always admin
            is_admin = true;
            // Double-check right before insert to avoid race condition
            const doubleCheck = await this.userService.getAllUsers();
            userCount = doubleCheck.length;
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
            const adminUser = await this.userService.getUserById(
              sessionUser.id,
            );
            if (!adminUser?.is_admin) {
              return next({
                status: 403,
                message: "Only admins can create users",
              });
            }
          }

          await this.userService.createUser({
            username,
            password,
            is_admin,
          });

          const user = { id, username };
          res.status(201).json(user);
        } catch (err) {
          next(err);
        }
      },
    );

    // Get a single user (no password)
    this.router.get("/:id", async (req, res: Response<UserPublic>, next) => {
      try {
        const user: any = await this.userService.getUserById(req.params.id);
        if (!user) return next({ status: 404, message: "User not found" });
        // Remove password fields if present
        const { password, password_hash, ...safeUser } = user;
        res.json(safeUser);
      } catch (err) {
        next(err);
      }
    });
  }
}
