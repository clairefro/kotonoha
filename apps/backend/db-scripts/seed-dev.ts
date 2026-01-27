import { createClient } from "@libsql/client";
import { LOCAL_DEV_DB_PATH } from "../constants";
import { hashPassword } from "../src/utils/db-utils";
import { clear } from "./clear-dev";

const db = createClient({
  url: `file:${LOCAL_DEV_DB_PATH}`,
});

async function seed() {
  // Clean up tables using clear-dev function
  await clear(db);

  // Seed admin user
  const adminPassword = "password";
  const adminHash = await hashPassword(adminPassword);

  await db.execute(
    `INSERT INTO users (id, username, password_hash, is_admin) VALUES (?, ?, ?, ?)`,
    ["u_admin_1", "admin", adminHash, 1],
  );

  // Seed 3 items
  await db.execute(
    `INSERT INTO items (id, title, source_url, item_type, added_by) VALUES (?, ?, ?, ?, ?)`,
    ["i_1", "First Article", "https://example.com/1", "article", "u_admin_1"],
  );
  await db.execute(
    `INSERT INTO items (id, title, source_url, item_type, added_by) VALUES (?, ?, ?, ?, ?)`,
    ["i_2", "Second Article", "https://example.com/2", "article", "u_admin_1"],
  );
  await db.execute(
    `INSERT INTO items (id, title, source_url, item_type, added_by) VALUES (?, ?, ?, ?, ?)`,
    ["i_3", "Third Article", "https://example.com/3", "article", "u_admin_1"],
  );
  console.log("Dev DB seeded with admin user and 3 items.");
  process.exit(0);
}

seed();
