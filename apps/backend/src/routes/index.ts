import { Router } from "express";
import { ItemsRoute } from "./ItemsRouter";
import { AuthRoute } from "./AuthRouter";
import { UsersRouter } from "./UsersRouter";
import { TagsRouter } from "./TagsRouter";

// import createUsersRouter from "./users"; // example for future

export default function createApiRouter(db: any) {
  const router = Router();
  router.use("/auth", new AuthRoute(db).router);
  router.use("/items", new ItemsRoute(db).router);
  router.use("/users", new UsersRouter(db).router);
  router.use("/tags", new TagsRouter(db).router);
  return router;
}
