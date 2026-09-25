import { Pool, type QueryResultRow } from "pg";

declare global {
  var workpulseDatabasePool: Pool | undefined;
}

function databaseUrl(): string {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) throw new Error("DATABASE_URL is not configured.");
  return value;
}

export function getDatabasePool(): Pool {
  if (!global.workpulseDatabasePool) {
    global.workpulseDatabasePool = new Pool({
      connectionString: databaseUrl(),
      max: 5,
    });
  }
  return global.workpulseDatabasePool;
}

export async function queryDatabase<Row extends QueryResultRow>(
  text: string,
  values: readonly unknown[] = [],
): Promise<Row[]> {
  const result = await getDatabasePool().query<Row>(text, [...values]);
  return result.rows;
}
