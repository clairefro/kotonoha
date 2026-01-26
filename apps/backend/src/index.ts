import express from "express";
import { readTextFile } from "./util";
import { createClient } from "@libsql/client";
import { ExampleType } from "shared-types";

import { LOCAL_DEV_DB_PATH, LOCAL_PROD_DB_PATH } from "../constants";

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

// Ensure schema from schema.sql
async function ensureDbSchema() {
  const schema = readTextFile("./db-schema.sql", __dirname);
  // Split on semicolons to support multiple statements
  for (const stmt of schema.split(/;\s*\n/)) {
    if (stmt.trim()) {
      await db.execute(stmt);
    }
  }
}
ensureDbSchema();

app.use(express.json());

app.get("/api/examples", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM example");
    // Map each row to ExampleType to ensure correct typing
    const examples: ExampleType[] = (result.rows as any[]).map((row) => ({
      id: row.id,
      name: row.name,
    }));
    res.json(examples);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/examples", async (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: "Missing id or name" });
  }
  try {
    await db.execute("INSERT INTO example (id, name) VALUES (?, ?)", [
      id,
      name,
    ]);
    res.status(201).json({ id, name });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
