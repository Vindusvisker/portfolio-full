"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import Shredder from "./shredder";
import type { RepoRow } from "@/lib/repo-groups";

const ROW = 82;
const GAP = 8;
const FALL = 150;
const WIDTH = 960;
const INSET = 14;
const STRIP = 11;
/** Navbar, top padding and heading block. Phones wrap the heading, so they reserve more. */
const chrome = () => (window.innerWidth >= 768 ? 200 : 270);

/**
 * The buried repos in a shredder that is pinned while you scroll past it.
 * Each notch of scroll feeds one more row through the rollers, bottom row
 * first, and the strips heap up underneath; scrolling back up brings them
 * back. Each row is a small death certificate for the repo.
 */
export function Buried({ rows }: { rows: RepoRow[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const n = rows.length;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.max(0, Math.min(n, Math.round(v * n)));
    setCount((c) => (c === next ? c : next));
  });

  const undo = useCallback(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const height = n * (ROW + GAP) + 4 + FALL + 24;

  // Shrink the whole machine on short viewports so it never spills out of
  // the pinned frame, and widen it before scaling so the result still fills
  // narrow screens. The shredder reads its own scale, so hit testing holds.
  const [fit, setFit] = useState({ scale: 1, width: WIDTH });
  useEffect(() => {
    const measure = () => {
      const scale = Math.min(
        1,
        Math.max(0.5, (window.innerHeight - chrome()) / height),
      );
      const width = Math.min(WIDTH, (window.innerWidth - 16) / scale);
      setFit({ scale, width });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [height]);
  const stripsPerRow = Math.ceil((fit.width - INSET * 2) / STRIP);

  if (n === 0) return null;
  const done = count === n;

  return (
    <div ref={ref} style={{ height: `calc(100svh + ${n * 22}vh)` }}>
      <div className="sticky top-[50px] flex h-[calc(100svh-50px)] flex-col items-center justify-center overflow-visible px-2 pt-24 md:pt-16">
        <div className="mb-4 w-full max-w-[960px] px-4">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest">
            Buried
          </h3>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Not touched in over a year. Keep scrolling.
          </p>
          <p
            className="mt-1 font-mono text-[11px] tabular-nums text-muted-foreground/70"
            aria-live="polite"
          >
            {count} of {n} shredded · {count * stripsPerRow} strips on the floor
            <button
              type="button"
              onClick={undo}
              tabIndex={done ? 0 : -1}
              aria-hidden={!done}
              className={`ml-3 underline decoration-border underline-offset-4 transition-opacity duration-700 hover:decoration-foreground ${
                done ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              That was everything. Undo? ↑
            </button>
          </p>
        </div>
        <div
          style={{ width: fit.width * fit.scale, height: height * fit.scale }}
        >
          <div
            style={{
              width: fit.width,
              transform: `scale(${fit.scale})`,
              transformOrigin: "top left",
            }}
          >
            <Shredder
              items={rows}
              shredCount={count}
              className="buried"
              width={fit.width}
              height={height}
              inset={INSET}
              gap={GAP}
              fallHeight={FALL}
              feedSpeed={220}
              stripWidth={STRIP}
              curl={1}
              pile
              slitColor="#1a1713"
              color="var(--foreground)"
              renderItem={(r) => (
                <div
                  className="relative flex flex-col justify-between rounded-[3px] border border-[#1a1713]/30 bg-[#e7e0d2] px-4 py-2.5 text-[#1a1713]"
                  style={{
                    height: ROW,
                    backgroundImage:
                      "linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0) 40%)",
                  }}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-display text-[24px] font-bold uppercase leading-none tracking-tight text-[#1a1713]/75 line-through decoration-[#b3402a] decoration-2">
                      {r.name}
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 -rotate-[6deg] rounded-[2px] border-[1.5px] border-[#b3402a] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#b3402a] mix-blend-multiply"
                    >
                      Buried
                    </span>
                  </div>
                  <p className="truncate font-sans text-[13px] leading-snug text-[#1a1713]/65">
                    {r.description || "Left no note."}
                  </p>
                  <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-[#1a1713]/55">
                    Born {r.born} · Last seen {r.lastSeen} ·{" "}
                    {r.commits > 0 ? `${r.commits} commits` : r.language}
                  </p>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
