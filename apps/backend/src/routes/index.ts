import { Router } from "express";
import { ItemsRoute } from "./ItemsRouter";
import { AuthRoute } from "./AuthRouter";

// import createUsersRouter from "./users"; // example for future

export default function createApiRouter(db: any) {
  const router = Router();
  router.use("/auth", new AuthRoute(db).router);
  router.use("/items", new ItemsRoute(db).router);
  return router;
}
