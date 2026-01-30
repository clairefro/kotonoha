// UserDAO: Handles direct DB access for users

export class UserDAO {
  constructor(private db: any) {}

  async getById(id: string) {
    const result = await this.db.execute("SELECT * FROM users WHERE id = ?", [
      id,
    ]);
    return result.rows[0] || null;
  }

  async getByUsername(username: string) {
    const result = await this.db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username],
    );
    return result.rows[0] || null;
  }

  async getAll() {
    const result = await this.db.execute("SELECT * FROM users");
    return result.rows;
  }

  async insert(user: {
    id: string;
    username: string;
    name: string;
    password: string;
    role: string;
  }) {
    const result = await this.db.execute(
      `INSERT INTO users (id, username, name, password, role) VALUES (?, ?, ?, ?, ?) RETURNING *`,
      [user.id, user.username, user.name, user.password, user.role],
    );
    return result.rows[0];
  }

  async update(
    id: string,
    updates: Partial<{
      username: string;
      name: string;
      password: string;
      role: string;
    }>,
  ) {
    const allowed: (keyof typeof updates)[] = [
      "username",
      "name",
      "password",
      "role",
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
    return result.rows[0] || null;
  }

  async delete(id: string) {
    return this.db.execute("DELETE FROM users WHERE id = ?", [id]);
  }
}
