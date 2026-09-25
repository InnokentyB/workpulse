import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const directory = dirname(fileURLToPath(import.meta.url));
const migration = await readFile(
  join(directory, "..", "db", "migrations", "001_accounts.sql"),
  "utf8",
);
const pool = new pg.Pool({ connectionString: databaseUrl, max: 1 });

try {
  await pool.query(migration);
  process.stdout.write("Account database migration completed.\n");
} finally {
  await pool.end();
}
