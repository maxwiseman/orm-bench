import { PrismaClient } from "@/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, neon } from "@neondatabase/serverless";

// Enable fetch-based HTTP for Neon in serverless environments
neonConfig.fetchConnectionCache = true;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

// Create a Neon SQL client bound to the DATABASE_URL
const neonSql = neon(databaseUrl);
const neonAdapter = new PrismaNeon(neonSql);

export const prisma = new PrismaClient({
  datasourceUrl: databaseUrl,
  adapter: neonAdapter,
});
