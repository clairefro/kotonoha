import { createClient } from "@libsql/client";
import { LOCAL_DEV_DB_PATH } from "../constants";

const db = createClient({
  url: `file:${LOCAL_DEV_DB_PATH}`,
});

async function seed() {
  await db.execute("DELETE FROM example");
  await db.execute("INSERT INTO example (id, name) VALUES (?, ?)", [
    "seed-1",
    "Foo 1",
  ]);
  await db.execute("INSERT INTO example (id, name) VALUES (?, ?)", [
    "seed-2",
    "Bar 2",
  ]);
  console.log("Dev DB seeded.");
  process.exit(0);
}

seed();
