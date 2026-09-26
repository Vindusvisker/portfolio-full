"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import type { RepoRow } from "@/lib/repo-groups";

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const modulo = (v: number, d: number) => ((v % d) + d) % d;
const smoothstep = (lo: number, hi: number, v: number) => {
  const x = clamp((v - lo) / (hi - lo || 1), 0, 1);
  return x * x * (3 - 2 * x);
};

type SpiralRow = RepoRow & { tag: string };

const RADIUS = 420;
const CARD_W = 300;
const CARD_H = 92;
const SPACING = 106;
const PERSPECTIVE = 1000;
const PER_TURN = 7;
const CENTER_SCALE = 1.06;
const EDGE_FADE = 0.3;
const EDGE_BLUR = 5;
const VH_PER_CARD = 16;

/**
 * The living repos on a helix, adapted from React Bits' InfiniteSpiral.
 * The stage is pinned while you scroll past it and every notch of scroll
 * turns the helix one card further, so each repo gets its moment in front.
 */
export function RepoSpiral({ active, dormant }: { active: RepoRow[]; dormant: RepoRow[] }) {
  const rows = useMemo<SpiralRow[]>(
    () => [...active.map((r) => ({ ...r, tag: "Breathing" })), ...dormant.map((r) => ({ ...r, tag: "Dormant" }))],
    [active, dormant]
  );
  const n = rows.length;

  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const target = useRef(0);
  const progress = useRef(0);

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start 80%", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    target.current = clamp(v, 0, 1) * Math.max(n - 1, 0);
  });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || n === 0) return;

    let frame = 0;
    let prev = performance.now();
    let bounds = stage.getBoundingClientRect();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ro = new ResizeObserver(() => {
      bounds = stage.getBoundingClientRect();
    });
    ro.observe(stage);

    const render = (time: number) => {
      const dt = Math.min((time - prev) / 1000, 0.05);
      prev = time;

      const blend = reduced.matches ? 1 : 1 - Math.exp(-dt * 11);
      progress.current += (target.current - progress.current) * blend;

      const half = n / 2;
      const width = Math.max(bounds.width, 1);
      const height = Math.max(bounds.height, 1);
      const cardW = Math.min(CARD_W, width - 48);
      const fit = Math.min(1, height / (SPACING * 5.5));
      const radius = Math.min(RADIUS, Math.max(24, (width - cardW) * 0.42)) * fit;
      const fadeStart = clamp(1 - EDGE_FADE, 0, 0.98);

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const offset = modulo(i - progress.current + half, n) - half;
        const edge = Math.min(Math.abs(offset) / Math.max(half, 1), 1);
        const opacity = 1 - smoothstep(fadeStart, 1, edge);
        const focus = 1 - Math.min(Math.abs(offset) / Math.max(PER_TURN * 0.65, 1), 1);
        const scale = (1 + (CENTER_SCALE - 1) * focus) * fit;
        const rad = (offset * (360 / PER_TURN) * Math.PI) / 180;
        const x = Math.sin(rad) * radius;
        const z = Math.cos(rad) * radius;
        const depthScale = clamp(PERSPECTIVE / Math.max(PERSPECTIVE - z, 1), 0.82, 1.12);
        const depth = (z / Math.max(radius, 1) + 1) / 2;
        const blur = EDGE_BLUR * Math.max(smoothstep(0.35, 1, edge), 0.7 * smoothstep(0.35, 1, 1 - depth));

        card.style.width = `${cardW}px`;
        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${offset * SPACING * fit}px, 0) scale(${scale * depthScale})`;
        card.style.opacity = opacity.toFixed(3);
        card.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : "none";
        card.style.zIndex = String(Math.round(depth * 100000) + i);
        card.style.pointerEvents = opacity > 0.25 && focus > 0.15 ? "auto" : "none";
      });

      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [n]);

  if (n === 0) return null;

  return (
    <div ref={wrapRef} style={{ height: `calc(100svh + ${n * VH_PER_CARD}vh)` }}>
      <div className="sticky top-[50px] flex h-[calc(100svh-50px)] flex-col items-center overflow-hidden pt-28 md:pt-12">
        <div className="relative z-10 w-full max-w-[800px] px-4">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest">Above ground</h3>
          <p className="mt-1 font-mono text-xs text-muted-foreground">Pushed in the last year. Scroll to turn the helix.</p>
        </div>
        <div
          ref={stageRef}
          className="relative min-h-0 w-full flex-1"
          style={{ perspective: `${PERSPECTIVE}px`, isolation: "isolate" }}
          role="list"
          aria-label="Repositories pushed in the last year"
        >
          {rows.map((r, i) => (
            <a
              key={r.id}
              ref={(node) => {
                cardRefs.current[i] = node;
              }}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              role="listitem"
              className="absolute left-1/2 top-1/2 block rounded-md border border-border bg-card px-4 py-3 font-mono text-xs shadow-[0_14px_38px_rgb(0_0_0/0.12)] transition-colors hover:border-foreground/40"
              style={{ width: CARD_W, height: CARD_H, willChange: "transform, opacity, filter", backfaceVisibility: "hidden" }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm font-bold">{r.name}</span>
                <span className="shrink-0 rounded-sm border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {r.tag}
                </span>
              </div>
              <p className="mt-1.5 line-clamp-2 min-h-[2.6em] leading-snug text-muted-foreground">
                {r.description || "No description."}
              </p>
              <p className="mt-1.5 tabular-nums text-muted-foreground">
                {r.language}
                {r.commits > 0 ? ` · ${r.commits}` : ""} · {r.ago}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
