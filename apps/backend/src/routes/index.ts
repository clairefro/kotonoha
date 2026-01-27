import { Router } from "express";

import createItemsRouter from "./items";
// import createUsersRouter from "./users"; // example for future

export default function createApiRouter(db: any) {
  const router = Router();
  router.use("/items", createItemsRouter(db));
  // router.use("/users", createUsersRouter(db)); // example for future
  return router;
}
