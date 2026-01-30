import { Item, UserId } from "shared-types";
// ItemDAO: Handles direct DB access for items

export class ItemDAO {
  constructor(private db: any) {}

  async getById(id: string): Promise<Item | null> {
    const result = await this.db.execute("SELECT * FROM items WHERE id = ?", [
      id,
    ]);
    return result.rows[0] || null;
  }

  async getAll(): Promise<Item[]> {
    const result = await this.db.execute(
      "SELECT * FROM items ORDER BY created_at DESC",
    );
    return result.rows;
  }

  async insert(item: {
    id: string;
    title: string;
    source_url: string | null;
    item_type: string;
    added_by: string;
  }): Promise<Item> {
    const result = await this.db.execute(
      `INSERT INTO items (id, title, source_url, item_type, added_by) VALUES (?, ?, ?, ?, ?) RETURNING *`,
      [item.id, item.title, item.source_url, item.item_type, item.added_by],
    );
    return result.rows[0];
  }

  async update(
    id: string,
    updates: Partial<{
      title: string;
      source_url: string | null;
      item_type: string;
    }>,
  ): Promise<Item | null> {
    const allowed: (keyof typeof updates)[] = [
      "title",
      "source_url",
      "item_type",
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
    const sql = `UPDATE items SET ${setClauses.join(", ")} WHERE id = ? RETURNING *`;
    const result = await this.db.execute(sql, [...values, id]);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<void> {
    return this.db.execute("DELETE FROM items WHERE id = ?", [id]);
  }

  async getAddedBy(id: string): Promise<UserId | undefined> {
    const result = await this.db.execute(
      "SELECT added_by FROM items WHERE id = ?",
      [id],
    );
    return result.rows[0]?.added_by;
  }
}
