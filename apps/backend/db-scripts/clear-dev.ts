import { createClient } from "@libsql/client";

const db = createClient({
  url: `file:./dev-db.sqlite`,
});

async function clear() {
  // Specify head order for deletion
  const headOrder = [
    "activity_receipts",
    "activities",
    "comments",
    "entity_tags",
    "item_authors",
    "items",
    "tags",
    "users",
  ];
  // Get all user tables
  const result = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
  );
  const allTables = (result.rows as any[]).map((row) => row.name);
  // Add any tables not in headOrder to the end
  const tableOrder = [
    ...headOrder,
    ...allTables.filter((t) => !headOrder.includes(t)),
  ];
  for (const table of tableOrder) {
    console.log(`Deleting from table '${table}'...`);
    await db.execute(`DELETE FROM ${table}`);
  }
  console.log("All data cleared from dev DB tables:", tableOrder.join(", "));
  process.exit(0);
}

clear();
