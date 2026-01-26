import { createClient } from "@libsql/client";

const db = createClient({
  url: `file:./dev-db.sqlite`,
});

async function clear() {
  // Get all user tables
  const result = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
  );
  const tables = (result.rows as any[]).map((row) => row.name);
  for (const table of tables) {
    console.log(`Deleting from table '${table}'...`);
    await db.execute(`DELETE FROM ${table}`);
  }
  console.log("All data cleared from dev DB tables:", tables.join(", "));
  process.exit(0);
}

clear();
