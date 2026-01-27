import { BaseRouter } from "./_BaseRouter";
import { createId } from "../utils/db-utils";
import { Response } from "express";
import { ItemsResponse, ItemResponse } from "shared-types";

export class ItemsRoute extends BaseRouter {
  constructor(private db: any) {
    super("items");
  }

  protected defineRoutes() {
    this.router.get("/", async (req, res: Response<ItemsResponse>, next) => {
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
        res.json({ items });
      } catch (err) {
        next(err);
      }
    });

    this.router.post("/", async (req, res: Response<ItemResponse>, next) => {
      const { title, source_url, item_type = "article", added_by } = req.body;
      if (!title) {
        return next({ status: 400, message: "Missing title" });
      }
      if (!added_by) {
        return next({ status: 400, message: "Missing added_by" });
      }
      const id = createId.item();
      try {
        const result = await this.db.execute(
          `INSERT INTO items (id, title, source_url, item_type, added_by) VALUES (?, ?, ?, ?, ?) RETURNING *`,
          [id, title, source_url || null, item_type, added_by],
        );
        const item = result.rows[0];
        res.status(201).json({ item });
      } catch (err) {
        next(err);
      }
    });
  }
}
