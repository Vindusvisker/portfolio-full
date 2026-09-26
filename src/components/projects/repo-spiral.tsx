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

type SpiralRow = RepoRow & { tag: string; alive: boolean };

/** A small, stable tilt per card so the notes look pinned by hand. */
const tilt = (i: number) => (((i * 7919) % 7) - 3) * 0.7;
const tapeTilt = (i: number) => (((i * 104729) % 9) - 4) * 1.5;

const RADIUS = 420;
const CARD_W = 300;
const SPACING = 132;
const PERSPECTIVE = 1000;
const PER_TURN = 7;
const CENTER_SCALE = 1.06;
const EDGE_FADE = 0.3;
const EDGE_BLUR = 3;
const DEPTH_BLUR = 1.5;
const VH_PER_CARD = 26;

/**
 * The living repos on a helix, adapted from React Bits' InfiniteSpiral.
 * The stage is pinned while you scroll past it and every notch of scroll
 * turns the helix one card further, so each repo gets its moment in front.
 */
export function RepoSpiral({ active, dormant }: { active: RepoRow[]; dormant: RepoRow[] }) {
  const rows = useMemo<SpiralRow[]>(
    () => [
      ...active.map((r) => ({ ...r, tag: "Breathing", alive: true })),
      ...dormant.map((r) => ({ ...r, tag: "Dormant", alive: false })),
    ],
    [active, dormant]
  );
  const n = rows.length;

  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const target = useRef(0);
  const progress = useRef(0);

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start 25%", "end end"] });
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
      const cy = height * 0.54;

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
        const y = cy + offset * SPACING * fit;
        const topFade = smoothstep(40, 160, y);
        const back = smoothstep(0.45, 1, 1 - depth);
        const blur = Math.max(EDGE_BLUR * smoothstep(0.5, 1, edge), DEPTH_BLUR * back);

        card.style.width = `${cardW}px`;
        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) rotate(${tilt(i)}deg) scale(${scale * depthScale})`;
        card.style.opacity = (opacity * topFade * (1 - 0.35 * back)).toFixed(3);
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
      <div className="sticky top-[50px] flex h-[calc(100svh-50px)] flex-col items-center overflow-hidden pt-16 md:pt-12">
        <div className="relative z-10 w-full max-w-[800px] px-4">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest">Above ground</h3>
          <p className="mt-1 font-mono text-xs text-muted-foreground">Pushed in the last year. Scroll to turn the helix.</p>
        </div>
        <div
          ref={stageRef}
          className="relative mt-8 min-h-0 w-full flex-1 overflow-hidden"
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
              className="group absolute left-1/2 top-0 block text-[#1a1713]"
              style={{ width: CARD_W, willChange: "transform, opacity, filter", backfaceVisibility: "hidden" }}
            >
              <span
                aria-hidden="true"
                className="tape absolute -top-2.5 left-1/2 z-10 h-5 w-16 -translate-x-1/2"
                style={{ transform: `translateX(-50%) rotate(${tapeTilt(i)}deg)` }}
              />
              <div
                className={`relative rounded-[3px] border px-4 pb-3 pt-4 shadow-[0_14px_28px_-12px_rgba(26,23,19,0.45)] transition-transform group-hover:-translate-y-0.5 ${
                  r.alive ? "border-[#8a7a2a]/40 bg-[#f4e7a6]" : "border-[#1a1713]/30 bg-[#f7f3ea]"
                }`}
                style={{ backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0) 35%)" }}
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#1a1713]/50">
                  Note {String(i + 1).padStart(2, "0")} · {r.language}
                </p>
                <h4 className="mt-1 truncate font-display text-[22px] font-bold uppercase leading-none tracking-tight">{r.name}</h4>
                <p className="mt-2 truncate font-sans text-[13px] leading-snug text-[#1a1713]/80">
                  {r.description || "No description. Speaks for itself."}
                </p>
                <p className="mt-2.5 flex items-baseline justify-between border-t border-[#1a1713]/15 pt-2 font-mono text-[11px] tabular-nums text-[#1a1713]/60">
                  <span>{r.commits > 0 ? `${r.commits} commits` : "Fresh"}</span>
                  <span>{r.ago}</span>
                </p>
                <span
                  aria-hidden="true"
                  className={`absolute right-3 top-3 rounded-[2px] border-[1.5px] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] mix-blend-multiply ${
                    r.alive ? "rotate-[7deg] border-[#b3402a] text-[#b3402a]" : "-rotate-[5deg] border-[#1a1713]/55 text-[#1a1713]/55"
                  }`}
                >
                  {r.tag}
                </span>
                <span className="sr-only">{r.tag}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
