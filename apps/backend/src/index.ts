import "express-session";
import express from "express";
import { getSessionMiddleware } from "./middleware/session";
import { ensureDbSchema } from "./utils/db-utils";
import { createClient } from "@libsql/client";
import { LOCAL_DEV_DB_PATH, LOCAL_PROD_DB_PATH } from "../constants";
import { readTextFile } from "./util";
import createApiRouter from "./routes";
import { errorHandler } from "./middleware/errorHandler";

// Determine environment
const isDev = process.env.NODE_ENV !== "production";

const app = express();
// Use 4000 for dev, 4001 for prod unless PORT is set
const port = process.env.PORT || (isDev ? 4000 : 4001);

// DB connection: Turso (remote) or fallback to local SQLite (dev)
const tursoUrl = process.env.TURSO_DB_URL;
const tursoAuthToken = process.env.TURSO_DB_AUTH_TOKEN;

const localDbPath = isDev ? LOCAL_DEV_DB_PATH : LOCAL_PROD_DB_PATH;

const db = createClient({
  url: tursoUrl || `file:${localDbPath}`,
  authToken: tursoUrl ? tursoAuthToken : undefined /* local, no auth needed */,
  // TODO: add encryptionKey prop
});

// Ensure schema from db-schema.sql
const dbSchema = readTextFile("./db-schema.sql", __dirname);
ensureDbSchema(db, dbSchema);

app.use(express.json());

// Session middleware (in-memory store for demo; use Redis in prod)
app.use(getSessionMiddleware());

// Register API routes
app.use("/api", createApiRouter(db));

// Standard error-handling middleware (returns { error: string })
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
