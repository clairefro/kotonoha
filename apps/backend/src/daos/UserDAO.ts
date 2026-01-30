import { UserPublic, UserPrivate } from "shared-types";

// ============
function stripPasswordHash(user: UserPrivate): UserPublic {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...rest } = user;
  return rest;
}
// ============

export class UserDAO {
  constructor(private db: any) {}

  async getById(id: string): Promise<UserPublic | null> {
    const result = await this.db.execute("SELECT * FROM users WHERE id = ?", [
      id,
    ]);
    return stripPasswordHash(result.rows[0] || null);
  }

  async getByIdPrivate(id: string): Promise<UserPrivate | null> {
    const result = await this.db.execute("SELECT * FROM users WHERE id = ?", [
      id,
    ]);
    return result.rows[0] || null;
  }

  async getByUsernamePublic(username: string): Promise<UserPublic | null> {
    const result = await this.db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username],
    );
    return stripPasswordHash(result.rows[0] || null);
  }

  async getByUsernamePrivate(username: string): Promise<UserPrivate | null> {
    const result = await this.db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username],
    );
    return result.rows[0] || null;
  }

  async getAll(): Promise<UserPublic[]> {
    const result = await this.db.execute("SELECT * FROM users");
    return result.rows.map(stripPasswordHash) as UserPublic[];
  }

  async insert(user: {
    id: string;
    username: string;
    password_hash: string;
    is_admin?: boolean;
  }): Promise<UserPublic> {
    const result = await this.db.execute(
      `INSERT INTO users (id, username, password_hash, is_admin) VALUES (?, ?, ?, ?) RETURNING *`,
      [user.id, user.username, user.password_hash, user.is_admin ?? false],
    );
    return stripPasswordHash(result.rows[0]);
  }

  async update(
    id: string,
    updates: Partial<{
      username: string;
      password_hash: string;
      is_admin: boolean;
    }>,
  ): Promise<UserPublic | null> {
    const allowed: (keyof typeof updates)[] = [
      "username",
      "password_hash",
      "is_admin",
    ];
    const setClauses: string[] = [];
    const values: any[] = [];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        setClauses.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }
    if (setClauses.length === 0) return null;
    const sql = `UPDATE users SET ${setClauses.join(", ")} WHERE id = ? RETURNING *`;
    const result = await this.db.execute(sql, [...values, id]);
    return stripPasswordHash(result.rows[0] || null);
  }

  async delete(id: string): Promise<void> {
    await this.db.execute("DELETE FROM users WHERE id = ?", [id]);
  }
}
