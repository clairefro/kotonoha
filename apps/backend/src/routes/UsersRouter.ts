import { BaseRouter } from "./_BaseRouter";
import { createId, hashPassword } from "../utils/db-utils";

export class UsersRouter extends BaseRouter {
  constructor(private db: any) {
    super("users");
  }

  protected defineRoutes() {
    // Get all users (no passwords)
    this.router.get("/", async (req, res) => {
      try {
        const result = await this.db.execute(
          "SELECT id, username, is_admin, created_at FROM users",
        );
        res.json(result.rows);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    // Check if users table is empty
    this.router.get("/empty", async (req, res) => {
      try {
        const result = await this.db.execute(
          "SELECT COUNT(*) as count FROM users",
        );
        const isEmpty = Number(result.rows[0]?.count) === 0;
        res.json({ empty: isEmpty });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    // Create a new user (admin only, except first user)
    this.router.post("/", async (req, res) => {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Missing username or password" });
      }
      const id = createId.user();
      try {
        // Check user count
        const countResult = await this.db.execute(
          "SELECT COUNT(*) as count FROM users",
        );
        const userCount = Number(countResult.rows[0]?.count || 0);
        let is_admin = 0;
        if (userCount === 0) {
          // First user: always admin
          is_admin = 1;
        } else {
          // Only admins can create users
          const sessionUser = req.session?.user;
          if (!sessionUser) {
            return res
              .status(403)
              .json({ error: "Only admins can create users" });
          }
          // Fetch user from DB to check is_admin
          const adminCheck = await this.db.execute(
            "SELECT is_admin FROM users WHERE id = ?",
            [sessionUser.id],
          );
          if (!adminCheck.rows[0]?.is_admin) {
            return res
              .status(403)
              .json({ error: "Only admins can create users" });
          }
        }
        const password_hash = await hashPassword(password);
        await this.db.execute(
          `INSERT INTO users (id, username, password_hash, is_admin) VALUES (?, ?, ?, ?)`,
          [id, username, password_hash, is_admin],
        );
        res.status(201).json({ id, username, is_admin });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    // Get a single user (no password)
    this.router.get("/:id", async (req, res) => {
      try {
        const result = await this.db.execute(
          "SELECT id, username, is_admin, created_at FROM users WHERE id = ?",
          [req.params.id],
        );
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });
  }
}
