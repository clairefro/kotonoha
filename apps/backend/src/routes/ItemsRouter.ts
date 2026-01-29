/// <reference path="../../../../types/express-session.d.ts" />

import { BaseRouter } from "./_BaseRouter";
import { createId } from "../utils/db-utils";
import { Response, Request, NextFunction } from "express";

import { Item } from "shared-types";

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
        if (!id || typeof id !== "string" || !id.trim()) {
          return next({
            status: 400,
            message: "Missing or invalid id parameter",
          });
        }
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
      },
    );

    this.router.post(
      "/",
      requireAuth,
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
