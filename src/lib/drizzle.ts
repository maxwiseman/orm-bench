import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from "@neondatabase/serverless";
import * as schema from "./schema";

neonConfig.fetchConnectionCache = true;

let cachedDb: ReturnType<typeof drizzle> | undefined;
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!cachedDb) {
    const sql = neon(databaseUrl);
    cachedDb = drizzle(sql, { schema });
  }
  return cachedDb;
}
