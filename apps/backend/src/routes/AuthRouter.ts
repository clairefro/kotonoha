/// <reference path="../../../../types/express-session.d.ts" />

import { verifyPassword } from "../utils/db-utils";
import { BaseRouter } from "./_BaseRouter";

export class AuthRoute extends BaseRouter {
  constructor(private db: any) {
    super("auth");
  }

  protected defineRoutes() {
    // POST /api/auth/login
    this.router.post("/login", async (req, res) => {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Missing username or password" });
      }
      try {
        // Fetch user by username
        const result = await this.db.execute(
          "SELECT id, username, password_hash FROM users WHERE username = ?",
          [username],
        );
        const user = result.rows[0];
        if (!user) {
          return res.status(401).json({ error: "Invalid credentials" });
        }
        // Compare password with hash
        const match = await verifyPassword(password, user.password_hash);
        if (!match) {
          return res.status(401).json({ error: "Invalid credentials" });
        }
        req.session.user = { id: user.id, username: user.username };
        res.json({ user: { id: user.id, username: user.username } });
      } catch (err) {
        res.status(500).json({ error: "Server error" });
      }
    });

    // GET /api/auth/session
    this.router.get("/session", (req, res) => {
      if (req.session.user) {
        res.json({ user: req.session.user });
      } else {
        res.status(401).json({ error: "Not authenticated" });
      }
    });

    // POST /api/auth/logout
    this.router.post("/logout", (req, res) => {
      req.session.destroy(() => {
        res.json({ ok: true });
      });
    });
  }
}
