import express from "express";
import { ensureDbSchema } from "./utils/db-utils";
import { createClient } from "@libsql/client";

import { LOCAL_DEV_DB_PATH, LOCAL_PROD_DB_PATH } from "../constants";
import { readTextFile } from "./util";

// Determine environment
const isDev = process.env.NODE_ENV !== "production";

const app = express();
// Use 4000 for dev, 4001 for prod unless PORT is set
const port = process.env.PORT || (isDev ? 4000 : 4001);

// DB connection: Turso (remote) or local SQLite (dev)
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

// Items API
app.get("/api/items", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM items");
    const items = (result.rows as any[]).map((row) => ({
      id: row.id,
      title: row.title,
      source_url: row.source_url,
      item_type: row.item_type,
      added_by: row.added_by,
      created_at: row.created_at,
    }));
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
