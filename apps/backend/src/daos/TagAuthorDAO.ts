// TagAuthorDAO: Handles direct DB access for tags and authors

export class TagAuthorDAO {
  constructor(private db: any) {}

  async upsertTagOrAuthor(obj: {
    id?: string;
    name: string;
    type: "tag" | "author";
  }) {
    if (obj.id) return obj.id;
    const prefix = obj.type === "author" ? "h_" : "t_";
    const existing = await this.db.execute(
      `SELECT id FROM tags WHERE name = ? AND id LIKE ? LIMIT 1`,
      [obj.name, `${prefix}%`],
    );
    if (existing.rows.length > 0) return existing.rows[0].id;
    const newId = prefix + require("nanoid").nanoid(14);
    await this.db.execute(`INSERT INTO tags (id, name) VALUES (?, ?)`, [
      newId,
      obj.name,
    ]);
    return newId;
  }

  async addEntityTags(itemId: string, tagIds: string[]) {
    for (const tagId of tagIds) {
      await this.db.execute(
        `INSERT OR IGNORE INTO entity_tags (entity_id, tag_id) VALUES (?, ?)`,
        [itemId, tagId],
      );
    }
  }

  async addItemAuthors(itemId: string, authorIds: string[]) {
    for (const authorId of authorIds) {
      await this.db.execute(
        `INSERT OR IGNORE INTO item_authors (item_id, author_id) VALUES (?, ?)`,
        [itemId, authorId],
      );
    }
  }
}
