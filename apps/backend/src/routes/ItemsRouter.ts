/// <reference path="../../../../types/express-session.d.ts" />

import { BaseRouter } from "./_BaseRouter";
import { createId } from "../utils/db-utils";
import { Response, Request, NextFunction } from "express";

import { Item, TagOrAuthor } from "shared-types";
import { ItemService } from "../services/ItemService";
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
  private itemService: ItemService;
  constructor(db: any) {
    super("items");
    this.itemService = new ItemService(db);
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
          const item = await this.itemService.getItemById(id);
          if (!item) return next({ status: 404, message: "Item not found" });
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
          const items = await this.itemService.getAllItems();
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
        try {
          const item = await this.itemService.createItem({
            id,
            title,
            source_url: source_url || null,
            item_type,
            added_by,
            tags,
            authors,
          });
          res.status(201).json(item);
        } catch (err) {
          next(err);
        }
      },
    );

    this.router.patch(
      ":id",
      requireAuth,
      validateParams(IdParamSchema),
      validateBody(UpdateItemRequestSchema),
      async (
        req: Request<{ id: string }, {}, UpdateItemRequest>,
        res: Response<Item>,
        next: NextFunction,
      ) => {
        const { id } = req.params;

        const updates = req.body;
        try {
          const item = await this.itemService.updateItem(id, updates);
          if (!item) return next({ status: 404, message: "Item not found" });
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
        const addedBy = await this.itemService.getAddedBy(id);
        if (!addedBy) {
          return next({ status: 404, message: "Item not found" });
        }
        if (addedBy !== sessionUser.id) {
          return next({
            status: 403,
            message: "You can only delete items you added",
          });
        }
        // Proceed to delete
        await this.itemService.deleteItem(id);
        res.status(204).end();
      } catch (err) {
        next(err);
      }
    });
  }
}
