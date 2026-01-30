/// <reference path="../../../../types/express-session.d.ts" />

import { BaseRouter } from "./_BaseRouter";
import { createId } from "../utils/db-utils";
import { Response, Request, NextFunction } from "express";

import { Item, TagOrAuthor } from "shared-types";
import {
  CreateItemRequest,
  CreateItemRequestSchema,
  UpdateItemRequest,
  UpdateItemRequestSchema,
} from "shared-types/validation/items";
import { validateBody, validateParams } from "../middleware/validation";
import { requireAuth } from "../middleware/auth";
import { IdParamSchema } from "shared-types/validation/general";

export class ItemsRoute extends BaseRouter {
  constructor(private db: any) {
    super("items");
  }

  protected defineRoutes() {
    // Get item by id
    this.router.get(
      "/:id",
      requireAuth,
      validateParams(IdParamSchema),
      async (req: Request, res: Response<Item>, next: NextFunction) => {
        const { id } = req.params;

        try {
          const result = await this.db.execute(
            "SELECT * FROM items WHERE id = ?",
            [id],
          );
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
      },
    );
    // get all items (TODO: pagination)
    this.router.get(
      "/",
      requireAuth,
      async (_req: Request, res: Response<Item[]>, next: NextFunction) => {
        try {
          const result = await this.db.execute(
            "SELECT * FROM items ORDER BY created_at DESC",
          );
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
      },
    );

    this.router.post(
      "/",
      requireAuth,
      validateBody(CreateItemRequestSchema),
      async (
        req: Request<{}, {}, CreateItemRequest>,
        res: Response,
        next: NextFunction,
      ) => {
        const {
          title,
          source_url,
          item_type,
          added_by,
          tags = [],
          authors = [],
        } = req.body;
        const id = createId.item();
        const db = this.db;

        try {
          // Insert item
          const result = await db.execute(
            `INSERT INTO items (id, title, source_url, item_type, added_by) VALUES (?, ?, ?, ?, ?) RETURNING *`,
            [id, title, source_url || null, item_type, added_by],
          );
          // Helper to upsert tag/author and return id
          async function upsertTagOrAuthor(obj: TagOrAuthor) {
            if (obj.id) return obj.id;
            // Prefix: h_ for author, t_ for tag
            const prefix = obj.type === "author" ? "h_" : "t_";
            // Check if tag exists by name and type
            const existing = await db.execute(
              `SELECT id FROM tags WHERE name = ? AND id LIKE ? LIMIT 1`,
              [obj.name, `${prefix}%`],
            );
            if (existing.rows.length > 0) return existing.rows[0].id;
            // Create new tag
            const newId = prefix + require("nanoid").nanoid(14);
            await db.execute(`INSERT INTO tags (id, name) VALUES (?, ?)`, [
              newId,
              obj.name,
            ]);
            return newId;
          }

          // Upsert all tags and authors, collect ids
          const tagIds = [];
          for (const tag of tags) {
            const tagId = await upsertTagOrAuthor({ ...tag, type: "tag" });
            tagIds.push(tagId);
          }
          const authorIds = [];
          for (const author of authors) {
            const authorId = await upsertTagOrAuthor({
              ...author,
              type: "author",
            });
            authorIds.push(authorId);
          }

          // Insert into entity_tags (for tags)
          for (const tagId of tagIds) {
            await db.execute(
              `INSERT OR IGNORE INTO entity_tags (entity_id, tag_id) VALUES (?, ?)`,
              [id, tagId],
            );
          }
          // Insert into item_authors (for authors)
          for (const authorId of authorIds) {
            await db.execute(
              `INSERT OR IGNORE INTO item_authors (item_id, author_id) VALUES (?, ?)`,
              [id, authorId],
            );
          }

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

    this.router.patch(
      ":id",
      requireAuth,
      validateBody(UpdateItemRequestSchema),
      async (
        req: Request<{ id: string }, {}, UpdateItemRequest>,
        res: Response<Item>,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        if (!id || typeof id !== "string" || !id.trim()) {
          return next({
            status: 400,
            message: "Missing or invalid id parameter",
          });
        }
        const updates = req.body;
        try {
          const allowed: (keyof UpdateItemRequest)[] = [
            "title",
            "source_url",
            "item_type",
          ];
          const setClauses = (
            Object.keys(updates) as (keyof UpdateItemRequest)[]
          )
            .filter(
              (key) => allowed.includes(key) && updates[key] !== undefined,
            )
            .map((key) => `${key} = ?`);
          const values = (Object.keys(updates) as (keyof UpdateItemRequest)[])
            .filter(
              (key) => allowed.includes(key) && updates[key] !== undefined,
            )
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
      },
    );

    // Delete an item
    this.router.delete("/:id", requireAuth, async (req, res, next) => {
      const { id } = req.params;
      if (!id || typeof id !== "string" || !id.trim()) {
        return next({
          status: 400,
          message: "Missing or invalid id parameter",
        });
      }
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
