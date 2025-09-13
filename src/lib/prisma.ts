import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

// Enable fetch-based HTTP for Neon in serverless environments
neonConfig.fetchConnectionCache = true;

let cached: PrismaClient | undefined;
export function getPrisma() {
  if (!cached) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    // Create Neon HTTP adapter for serverless-friendly fetch-based queries
    const neonAdapter = new PrismaNeonHTTP(databaseUrl, {} as any);
    cached = new PrismaClient({ adapter: neonAdapter });
  }
  return cached;
}
