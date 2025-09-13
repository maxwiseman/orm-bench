// Default Fluid Compute runtime is fine here
import { neon } from "@neondatabase/serverless";

export async function POST() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error("DATABASE_URL is not set");
    const sql = neon(databaseUrl);

    await sql`drop table if exists bench_items`;
    await sql`create table bench_items (
      id text primary key,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      name text not null,
      value integer not null,
      payload text not null
    )`;
    await sql`create index idx_bench_items_created_at on bench_items(created_at)`;
    await sql`create index idx_bench_items_updated_at on bench_items(updated_at)`;

    const seedCount = 200;
    for (let i = 0; i < seedCount; i++) {
      const id = crypto.randomUUID();
      await sql`insert into bench_items (id, name, value, payload) values (
        ${id}, ${"item-" + id.slice(0, 8)}, ${Math.floor(
        Math.random() * 1000
      )}, ${"x".repeat(512)}
      )`;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: `Prepared bench_items with ${seedCount} rows.`,
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ ok: false, error: e?.message || String(e) }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    );
  }
}
