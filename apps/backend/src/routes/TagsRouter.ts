import { BaseRouter } from "./_BaseRouter";
import { Response, Request, NextFunction } from "express";
import { TagOrAuthor } from "shared-types";
import { requireAuth } from "../middleware/auth";
import { validateParams } from "../middleware/validation";
import { IdParamSchema } from "shared-types/validation/general";

export class TagsRouter extends BaseRouter {
  constructor(private db: any) {
    super("tags");
  }

  protected defineRoutes() {
    // GET /api/tags - list all tags and authors
    this.router.get(
      "/",
      requireAuth,
      async (
        _req: Request,
        res: Response<TagOrAuthor[]>,
        next: NextFunction,
      ) => {
        try {
          const result = await this.db.execute("SELECT * FROM tags");
          res.json(result.rows);
        } catch (err) {
          next(err);
        }
      },
    );

    // GET /api/tags/:id - get tag/author by id
    this.router.get(
      "/:id",
      requireAuth,
      validateParams(IdParamSchema),
      async (req: Request, res: Response<TagOrAuthor>, next: NextFunction) => {
        try {
          const { id } = req.params;
          const result = await this.db.execute(
            "SELECT * FROM tags WHERE id = ?",
            [id],
          );
          const tag = result.rows[0];
          if (!tag) return next({ status: 404, message: "Tag not found" });
          res.json(tag);
        } catch (err) {
          next(err);
        }
      },
    );

    this.router.get(
      "/search",
      requireAuth,
      async (
        req: Request,
        res: Response<TagOrAuthor[]>,
        next: NextFunction,
      ) => {
        try {
          const { query } = req.query;
          if (!query || typeof query !== "string" || !query.trim()) {
            return res.json([]);
          }
          const result = await this.db.execute(
            `SELECT * FROM tags 
             WHERE LOWER(name) LIKE LOWER(?) 
             ORDER BY 
               CASE WHEN LOWER(name) LIKE LOWER(?) THEN 0 ELSE 1 END, 
               LOWER(name) ASC`,
            ["%" + query + "%", query.toLowerCase() + "%"],
          );
          res.json(result.rows);
        } catch (err) {
          next(err);
        }
      },
    );
  }
}
