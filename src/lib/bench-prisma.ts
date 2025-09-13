import { prisma } from "./prisma";

type Operation = "read" | "write" | "update" | "mixed";

export async function runBenchmarkPrisma(args: {
  operation: Operation;
  iterations: number;
  parallel: number;
}) {
  const { operation, iterations, parallel } = args;

  const tasks: Array<() => Promise<void>> = [];
  const durations: number[] = [];

  const doRead = async () => {
    await prisma.benchItem.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  };

  const doWrite = async () => {
    const id = crypto.randomUUID();
    await prisma.benchItem.create({
      data: {
        id,
        name: `item-${id.slice(0, 8)}`,
        value: Math.floor(Math.random() * 1000),
        payload: "x".repeat(512),
      },
    });
  };

  const doUpdate = async () => {
    const id = crypto.randomUUID();
    await prisma.benchItem.create({
      data: {
        id,
        name: `item-${id.slice(0, 8)}`,
        value: 0,
        payload: "x".repeat(256),
      },
    });
    await prisma.benchItem.update({
      where: { id },
      data: { value: Math.floor(Math.random() * 1000) },
    });
  };

  const opFn = (op: Operation) =>
    op === "read" ? doRead : op === "write" ? doWrite : doUpdate;

  const timed = (fn: () => Promise<void>) => async () => {
    const s = performance.now();
    await fn();
    const e = performance.now();
    durations.push(e - s);
  };

  for (let i = 0; i < iterations; i++) {
    if (operation === "mixed") {
      const rand = Math.random();
      const chosen = rand < 0.5 ? doRead : rand < 0.8 ? doWrite : doUpdate;
      tasks.push(timed(chosen));
    } else {
      tasks.push(timed(opFn(operation)));
    }
  }

  const start = performance.now();
  for (let i = 0; i < tasks.length; i += parallel) {
    const slice = tasks.slice(i, i + parallel);
    await Promise.all(slice.map((fn) => fn()));
  }
  const end = performance.now();

  const durationMs = end - start;
  const ops = iterations;
  const opsPerSec = (ops / (durationMs / 1000)).toFixed(2);

  // latency percentiles
  const sorted = durations.slice().sort((a, b) => a - b);
  const pct = (p: number) => {
    if (sorted.length === 0) return 0;
    const idx = Math.min(
      sorted.length - 1,
      Math.ceil((p / 100) * sorted.length) - 1
    );
    return sorted[idx];
  };
  const sum = durations.reduce((a, b) => a + b, 0);
  const avgMs = durations.length ? sum / durations.length : 0;
  const p50Ms = pct(50);
  const p95Ms = pct(95);
  const p99Ms = pct(99);

  return {
    result: {
      orm: "prisma",
      operation,
      iterations,
      parallel,
      durationMs,
      opsPerSec: Number(opsPerSec),
      avgMs,
      p50Ms,
      p95Ms,
      p99Ms,
    },
  } as const;
}
