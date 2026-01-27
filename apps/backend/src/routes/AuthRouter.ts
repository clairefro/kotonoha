/// <reference path="../../../../types/express-session.d.ts" />

import { BaseRoute } from "./_BaseRouter";

export class AuthRoute extends BaseRoute {
  constructor(private db: any) {
    super("auth");
  }

  protected defineRoutes() {
    // POST /api/auth/login
    this.router.post("/login", async (req, res) => {
      console.log("login req", req.body);
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Missing username or password" });
      }
      try {
        // TODO: implement password hashing. for now, calling password_hash directly
        const result = await this.db.execute(
          "SELECT id, username FROM users WHERE username = ? AND password_hash = ?",
          [username, password],
        );
        const user = result.rows[0];
        if (!user) {
          return res.status(401).json({ error: "Invalid credentials" });
        }
        req.session.user = user;
        res.json({ user });
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
