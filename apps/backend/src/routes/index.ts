import { Router } from "express";
import { ItemsRoute } from "./ItemsRoute";

// import createUsersRouter from "./users"; // example for future

export default function createApiRouter(db: any) {
  const router = Router();
  router.use("/items", new ItemsRoute(db).router);
  return router;
}
