"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type Result = {
  orm: "drizzle" | "prisma";
  operation: "read" | "write" | "update" | "mixed";
  iterations: number;
  parallel: number;
  durationMs: number;
  opsPerSec: number;
  avgMs?: number;
  p50Ms?: number;
  p95Ms?: number;
  p99Ms?: number;
};

async function callBench(path: string, body: any) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function Home() {
  const [iterations, setIterations] = useState(200);
  const [parallel, setParallel] = useState(10);
  const [operation, setOperation] = useState<Result["operation"]>("mixed");
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);

  const run = async (orm: "drizzle" | "prisma") => {
    try {
      setLoading(orm);
      const path =
        orm === "drizzle" ? "/api/bench-drizzle" : "/api/bench-prisma";
      const { result } = await callBench(path, {
        iterations,
        parallel,
        operation,
      });
      setResults((r) => [result as Result, ...r]);
    } catch (e: any) {
      alert(e?.message || String(e));
    } finally {
      setLoading(null);
    }
  };

  const prepare = async () => {
    setLoading("prepare");
    try {
      const res = await fetch("/api/prepare", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
    } catch (e: any) {
      alert(e?.message || String(e));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ORM Bench (Vercel Fluid + Neon)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Iterations</Label>
              <Input
                type="number"
                value={iterations}
                onChange={(e) => setIterations(Number(e.target.value))}
                min={1}
                max={10000}
              />
            </div>
            <div className="space-y-2">
              <Label>Parallel</Label>
              <Input
                type="number"
                value={parallel}
                onChange={(e) => setParallel(Number(e.target.value))}
                min={1}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Operation</Label>
              <Select
                value={operation}
                onValueChange={(v) => setOperation(v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">read</SelectItem>
                  <SelectItem value="write">write</SelectItem>
                  <SelectItem value="update">update</SelectItem>
                  <SelectItem value="mixed">mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => run("drizzle")} disabled={!!loading}>
              {loading === "drizzle" ? "Running…" : "Run Drizzle"}
            </Button>
            <Button onClick={() => run("prisma")} disabled={!!loading}>
              {loading === "prisma" ? "Running…" : "Run Prisma"}
            </Button>
            <Button variant="secondary" onClick={prepare} disabled={!!loading}>
              {loading === "prepare" ? "Preparing…" : "Prepare Table"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="results">
        <TabsList>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        <TabsContent value="results">
          <div className="space-y-2">
            {results.length === 0 && (
              <p className="text-sm text-muted-foreground">No results yet.</p>
            )}
            {results.map((r, i) => (
              <Card key={i}>
                <CardContent className="py-4 text-sm">
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    <div>
                      <b>ORM</b>
                      <div>{r.orm}</div>
                    </div>
                    <div>
                      <b>Op</b>
                      <div>{r.operation}</div>
                    </div>
                    <div>
                      <b>Iter</b>
                      <div>{r.iterations}</div>
                    </div>
                    <div>
                      <b>Par</b>
                      <div>{r.parallel}</div>
                    </div>
                    <div>
                      <b>Time</b>
                      <div>{r.durationMs.toFixed(0)} ms</div>
                    </div>
                    <div>
                      <b>Ops/s</b>
                      <div>{r.opsPerSec}</div>
                    </div>
                    <div className="col-span-2">
                      <b>p95</b>
                      <div>{(r.p95Ms ?? 0).toFixed(2)} ms</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
