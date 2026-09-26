"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import Shredder from "./shredder";
import type { RepoRow } from "@/lib/repo-groups";

const ROW = 50;
const GAP = 9;
const FALL = 170;

/**
 * The buried repos in a shredder that is pinned while you scroll past it.
 * Each notch of scroll feeds one more row through the rollers, bottom row
 * first; scrolling back up brings them back.
 */
export function Buried({ rows }: { rows: RepoRow[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const n = rows.length;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.max(0, Math.min(n, Math.round(v * n)));
    setCount((c) => (c === next ? c : next));
  });

  if (n === 0) return null;
  const height = n * (ROW + GAP) + 4 + FALL + 24;

  return (
    <div ref={ref} style={{ height: `calc(100svh + ${n * 22}vh)` }}>
      <div className="sticky top-[50px] flex h-[calc(100svh-50px)] flex-col items-center justify-center overflow-visible px-2 pt-24 md:pt-28">
        <div className="mb-5 w-full max-w-[800px] px-4">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest">Buried</h3>
          <p className="mt-1 font-mono text-xs text-muted-foreground">Not touched in over a year. Keep scrolling.</p>
        </div>
        <Shredder
          items={rows}
          shredCount={count}
          className="buried"
          width={800}
          height={height}
          inset={14}
          gap={GAP}
          fallHeight={FALL}
          feedSpeed={220}
          stripWidth={11}
          curl={1}
          slitColor="#1a1713"
          color="var(--foreground)"
          renderItem={(r) => (
            <div
              className="flex items-baseline gap-4 rounded-md border border-border bg-card px-4 font-mono text-sm"
              style={{ height: ROW }}
            >
              <span className="self-center font-bold">{r.name}</span>
              <span className="min-w-0 flex-1 self-center truncate text-muted-foreground">{r.description}</span>
              <span className="shrink-0 self-center tabular-nums text-muted-foreground">
                {r.language} · {r.ago}
              </span>
            </div>
          )}
        />
      </div>
    </div>
  );
}
