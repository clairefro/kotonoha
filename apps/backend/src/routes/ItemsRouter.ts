/// <reference path="../../../../types/express-session.d.ts" />

import { BaseRouter } from "./_BaseRouter";
import { createId } from "../utils/db-utils";
import { Response, Request, NextFunction } from "express";

import { Item } from "shared-types";

import {
  CreateItemRequest,
  CreateItemRequestSchema,
} from "shared-types/validation/items";
import { validateBody } from "../middleware/validation";

export class ItemsRoute extends BaseRouter {
  constructor(private db: any) {
    super("items");
  }

  protected defineRoutes() {
    this.router.get("/", async (req, res: Response<Item[]>, next) => {
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
      } catch (err) {
        next(err);
      }
    });

    this.router.post(
      "/",
      validateBody(CreateItemRequestSchema),
      async (
        req: Request<{}, {}, CreateItemRequest>,
        res: Response<Item>,
        next: NextFunction,
      ) => {
        const { title, source_url, item_type, added_by } = req.body;
        const id = createId.item();
        try {
          const result = await this.db.execute(
            `INSERT INTO items (id, title, source_url, item_type, added_by) VALUES (?, ?, ?, ?, ?) RETURNING *`,
            [id, title, source_url || null, item_type, added_by],
          );
          const row = result.rows[0];
          const item: Item = {
            id: row.id,
            title: row.title,
            source_url: row.source_url,
            item_type: row.item_type,
            added_by: row.added_by,
            created_at: row.created_at,
          };
          res.status(201).json(item);
        } catch (err) {
          next(err);
        }
      },
    );

    // Update an item
    this.router.put("/:id", async (req, res: Response<Item>, next) => {
      const { id } = req.params;
      const updates = req.body;
      try {
        // Only allow updating certain fields
        const allowed = ["title", "source_url", "item_type"];
        const setClauses = Object.keys(updates)
          .filter((key) => allowed.includes(key))
          .map((key) => `${key} = ?`);
        const values = Object.keys(updates)
          .filter((key) => allowed.includes(key))
          .map((key) => updates[key]);
        if (setClauses.length === 0) {
          return next({ status: 400, message: "No valid fields to update" });
        }
        const sql = `UPDATE items SET ${setClauses.join(", ")} WHERE id = ? RETURNING *`;
        const result = await this.db.execute(sql, [...values, id]);
        const row = result.rows[0];
        if (!row) return next({ status: 404, message: "Item not found" });
        const item: Item = {
          id: row.id,
          title: row.title,
          source_url: row.source_url,
          item_type: row.item_type,
          added_by: row.added_by,
          created_at: row.created_at,
        };
        res.json(item);
      } catch (err) {
        next(err);
      }
    });

    // Delete an item
    this.router.delete("/:id", async (req, res, next) => {
      const { id } = req.params;
      const sessionUser = req.session?.user;
      if (!sessionUser) {
        return next({ status: 403, message: "Not authenticated" });
      }
      try {
        // Fetch the item to check ownership
        const result = await this.db.execute(
          "SELECT added_by FROM items WHERE id = ?",
          [id],
        );
        const item = result.rows[0];
        if (!item) {
          return next({ status: 404, message: "Item not found" });
        }
        if (item.added_by !== sessionUser.id) {
          return next({
            status: 403,
            message: "You can only delete items you added",
          });
        }
        // Proceed to delete
        await this.db.execute("DELETE FROM items WHERE id = ?", [id]);
        res.status(204).end();
      } catch (err) {
        next(err);
      }
    });
  }
}
