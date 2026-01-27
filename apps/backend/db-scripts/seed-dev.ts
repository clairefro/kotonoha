import { createClient } from "@libsql/client";
import { LOCAL_DEV_DB_PATH } from "../constants";

const db = createClient({
  url: `file:${LOCAL_DEV_DB_PATH}`,
});

async function seed() {
  // Clean up tables
  await db.execute("DELETE FROM items");
  await db.execute("DELETE FROM users");

  // Seed admin user
  await db.execute(
    `INSERT INTO users (id, username, password_hash, is_admin) VALUES (?, ?, ?, ?)`,
    [
      "u_admin_1",
      "admin",
      "$2b$10$examplehashstringforadmin", // Replace with a real hash in production
      1,
    ],
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
