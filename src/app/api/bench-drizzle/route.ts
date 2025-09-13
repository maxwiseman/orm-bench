import { runBenchmarkDrizzle } from "@/lib/bench-drizzle";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const operation = ["read", "write", "update", "mixed"].includes(
      body.operation
    )
      ? (body.operation as "read" | "write" | "update" | "mixed")
      : "mixed";
    const iterations = Math.max(
      1,
      Math.min(10000, Number(body.iterations) || 200)
    );
    const parallel = Math.max(1, Math.min(100, Number(body.parallel) || 10));

    const { result } = await runBenchmarkDrizzle({
      operation,
      iterations,
      parallel,
    });
    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
