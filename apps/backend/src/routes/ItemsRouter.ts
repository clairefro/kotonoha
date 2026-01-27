import { BaseRouter } from "./_BaseRouter";
import { createId } from "../utils/db-utils";

export class ItemsRoute extends BaseRouter {
  constructor(private db: any) {
    super("items");
  }

  protected defineRoutes() {
    this.router.get("/", async (req, res) => {
      try {
        const result = await this.db.execute("SELECT * FROM items");
        const items = (result.rows as any[]).map((row) => ({
          id: row.id,
          title: row.title,
          source_url: row.source_url,
          item_type: row.item_type,
          added_by: row.added_by,
          created_at: row.created_at,
        }));
        res.json(items);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    this.router.post("/", async (req, res) => {
      const {
        title,
        source_url,
        item_type = "article",
        added_by = "u_admin_1",
      } = req.body;
      if (!title) {
        return res.status(400).json({ error: "Missing title" });
      }
      const id = createId.item();
      try {
        await this.db.execute(
          `INSERT INTO items (id, title, source_url, item_type, added_by) VALUES (?, ?, ?, ?, ?)`,
          [id, title, source_url || null, item_type, added_by],
        );
        res.status(201).json({ id, title, source_url, item_type, added_by });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });
  }
}
