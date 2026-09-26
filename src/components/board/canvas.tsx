"use client";

import { animate, motion, useMotionTemplate, useMotionValue, useMotionValueEvent, type MotionValue } from "motion/react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { SHAKE_EVENT } from "./konami";
import { ROUTE_REVEAL_EVENT, routeCovered } from "@/components/route-transition";

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
/**
 * From tablets up, the world is a fixed sheet (WORLD px) scaled to fit the
 * stage, like a drawing on paper. Stickers are laid out in percent of that
 * sheet, so their spacing is the same on every screen size. Phones keep the
 * world equal to the stage, with its own sticker positions.
 */
const LARGE_SCREEN = "(min-width: 768px)";
export const WORLD = { w: 1440, h: 900 };
/** How much of the stage the sheet fills at rest; the rest is margin. */
const FIT = 0.75;
/** Portrait stages are limited by width, so the sheet may use nearly all of it. */
const FIT_PORTRAIT = 0.94;
/** Phones: the world is the stage itself, shown a little zoomed out so it breathes. */
const PHONE_SCALE = 0.86;
/**
 * Arrival: the board opens pulled back to `from` times the home zoom, so the
 * whole thing is in view, holds for `hold` seconds, then pushes in to the
 * home view over `seconds`. Phones get a slower, further move: there's a
 * ring of stickers out there worth a look.
 */
const ARRIVE = {
  phone: { from: 0.5, hold: 0.9, seconds: 2.6 },
  desktop: { from: 0.55, hold: 0.2, seconds: 1.6 },
};
const ARRIVE_EASE = [0.2, 0.8, 0.2, 1] as const;

const trim = (n: number) => (Math.round(n * 100) / 100).toString();

const CanvasContext = createContext<{ scale: MotionValue<number> } | null>(null);

/** Current canvas zoom, so children can convert screen pixels to canvas units. */
export function useCanvasScale() {
  return useContext(CanvasContext)?.scale ?? null;
}

interface CanvasProps {
  children: React.ReactNode;
}

/**
 * A pannable, zoomable stage. Children are laid out in a "world" the size of
 * the stage itself, so percent positions keep working. Drag the background
 * to pan, pinch or ctrl/cmd + wheel to zoom. A plain wheel still scrolls the
 * page. One finger on touch pans as well: the home page has nothing to scroll.
 */
export function Canvas({ children }: CanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const s = useMotionValue(1);
  const transform = useMotionTemplate`translate(${x}px, ${y}px) scale(${s})`;

  /** The "home" view that reset returns to */
  const home = useRef({ x: 0, y: 0, s: 1 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const last = useRef<{ cx: number; cy: number; dist: number } | null>(null);
  const [panning, setPanning] = useState(false);
  // Drawing scale for the title block: "1:1" at rest, "1:1.25" zoomed out to 0.8.
  const [scaleLabel, setScaleLabel] = useState("1:1");
  useMotionValueEvent(s, "change", (v) => {
    const r = v >= 1 ? `${trim(v)}:1` : `1:${trim(1 / v)}`;
    setScaleLabel((cur) => (cur === r ? cur : r));
  });

  const worldRef = useRef<HTMLDivElement>(null);

  /** Keep at least 30% of the world inside the stage on each axis. */
  const clampPan = useCallback((nx: number, ny: number, ns: number) => {
    const el = stageRef.current;
    const world = worldRef.current;
    if (!el || !world) return { x: nx, y: ny };
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    const ww = world.offsetWidth;
    const wh = world.offsetHeight;
    const minX = 0.3 * vw - ww * ns;
    const maxX = 0.7 * vw;
    const minY = 0.3 * vh - wh * ns;
    const maxY = 0.7 * vh;
    return {
      x: Math.min(maxX, Math.max(minX, nx)),
      y: Math.min(maxY, Math.max(minY, ny)),
    };
  }, []);

  /** Zoom to `nextScale` keeping the stage point (px, py) fixed on screen. */
  const zoomAt = useCallback(
    (px: number, py: number, nextScale: number, smooth = false) => {
      const el = stageRef.current;
      if (!el) return;
      const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
      const cs = s.get();
      const u = (px - x.get()) / cs;
      const v = (py - y.get()) / cs;
      const target = clampPan(px - u * ns, py - v * ns, ns);
      if (smooth) {
        const opts = { duration: 0.25, ease: "easeOut" as const };
        animate(x, target.x, opts);
        animate(y, target.y, opts);
        animate(s, ns, opts);
      } else {
        x.set(target.x);
        y.set(target.y);
        s.set(ns);
      }
    },
    [clampPan, s, x, y]
  );

  const zoomFromCenter = (factor: number) => {
    const el = stageRef.current;
    if (!el) return;
    zoomAt(el.clientWidth / 2, el.clientHeight / 2, s.get() * factor, true);
  };

  const reset = (duration = 0.35) => {
    const opts = { duration, ease: "easeOut" as const };
    animate(x, home.current.x, opts);
    animate(y, home.current.y, opts);
    animate(s, home.current.s, opts);
  };

  /** Jump to the pulled-back view, then push in to home. */
  const arriveSettings = () => (window.matchMedia(LARGE_SCREEN).matches ? ARRIVE.desktop : ARRIVE.phone);

  /** Jump to the pulled-back view without animating. */
  const pullBack = () => {
    const el = stageRef.current;
    if (!el) return;
    const h = home.current;
    const far = h.s * arriveSettings().from;
    // Zoom about the middle of the stage so the push-in stays centered.
    const px = el.clientWidth / 2;
    const py = el.clientHeight / 2;
    x.set(px - ((px - h.x) / h.s) * far);
    y.set(py - ((py - h.y) / h.s) * far);
    s.set(far);
  };

  /** From the pulled-back view, hold a beat, then push in to home. */
  const arrive = () => {
    pullBack();
    const h = home.current;
    const { hold, seconds } = arriveSettings();
    const opts = { duration: seconds, delay: hold, ease: ARRIVE_EASE };
    animate(x, h.x, opts);
    animate(y, h.y, opts);
    animate(s, h.s, opts);
  };

  // Pick the home view for this screen size and settle into it on load.
  // Re-fit (without animating) whenever the stage changes size.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const mq = window.matchMedia(LARGE_SCREEN);
    const apply = (settle: boolean) => {
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      if (mq.matches) {
        // Fit the sheet inside the stage and center it.
        const byWidth = vw / WORLD.w;
        const byHeight = vh / WORLD.h;
        const hs = byWidth < byHeight ? byWidth * FIT_PORTRAIT : byHeight * FIT;
        // Centered, except on tall stages where the sheet sits near the top so
        // the badge still hangs from the top edge.
        const y = Math.min((vh - WORLD.h * hs) / 2, vh * 0.12);
        home.current = { x: (vw - WORLD.w * hs) / 2, y, s: hs };
      } else {
        const hs = PHONE_SCALE;
        home.current = { x: (vw - vw * hs) / 2, y: (vh - vh * hs) / 2, s: hs };
      }
      if (settle) reset(0.6);
      else reset(0);
    };
    apply(false);
    // Open pulled back and push in. Under a route sheet, wait for it to lift.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let onReveal: (() => void) | null = null;
    if (!reduce) {
      if (routeCovered()) {
        onReveal = () => arrive();
        window.addEventListener(ROUTE_REVEAL_EVENT, onReveal, { once: true });
        // Hold the far view meanwhile, so the lift reveals the whole board.
        pullBack();
      } else {
        arrive();
      }
    }
    const onChange = () => apply(true);
    mq.addEventListener("change", onChange);
    let first = true;
    const ro = new ResizeObserver(() => {
      // The observer fires once on attach; the settle above already handled that.
      if (first) {
        first = false;
        return;
      }
      apply(false);
    });
    ro.observe(el);
    return () => {
      mq.removeEventListener("change", onChange);
      if (onReveal) window.removeEventListener(ROUTE_REVEAL_EVENT, onReveal);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wheel needs a non-passive listener to be able to prevent page zoom.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const factor = Math.exp(-e.deltaY * 0.01);
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, s.get() * factor);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [s, zoomAt]);

  const gestureFromPointers = () => {
    const pts = Array.from(pointers.current.values());
    if (pts.length >= 2) {
      const [a, b] = pts;
      return {
        cx: (a.x + b.x) / 2,
        cy: (a.y + b.y) / 2,
        dist: Math.hypot(a.x - b.x, a.y - b.y),
      };
    }
    return { cx: pts[0].x, cy: pts[0].y, dist: 0 };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
    last.current = gestureFromPointers();
    setPanning(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId) || !last.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const count = pointers.current.size;

    const now = gestureFromPointers();
    const rect = e.currentTarget.getBoundingClientRect();
    if (count >= 2 && last.current.dist > 0) {
      const ratio = now.dist / last.current.dist;
      zoomAt(now.cx - rect.left, now.cy - rect.top, s.get() * ratio);
    }
    const moved = clampPan(x.get() + now.cx - last.current.cx, y.get() + now.cy - last.current.cy, s.get());
    x.set(moved.x);
    y.set(moved.y);
    last.current = now;
  };

  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (pointers.current.size === 0) {
      last.current = null;
      setPanning(false);
    } else {
      last.current = gestureFromPointers();
    }
  };

  const buttonClass =
    "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black text-white transition-colors hover:border-white hover:bg-white hover:text-black md:h-7 md:w-7";

  return (
    <CanvasContext.Provider value={{ scale: s }}>
      <div
        ref={stageRef}
        data-stage=""
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onDoubleClick={(e) => {
          // Only the empty board: stickers and the deck stop this themselves.
          const t = e.target as HTMLElement;
          if (t === e.currentTarget || t.hasAttribute("data-world")) window.dispatchEvent(new CustomEvent(SHAKE_EVENT));
        }}
        className={`absolute inset-0 select-none overflow-hidden ${panning ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ touchAction: "none" }}
      >
        <div aria-hidden="true" className="board-glow pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="board-grid pointer-events-none absolute inset-0" />
        <motion.div
          ref={worldRef}
          data-world=""
          className="absolute inset-0 origin-top-left md:inset-auto md:left-0 md:top-0 md:h-[900px] md:w-[1440px]"
          style={{ transform }}
        >
          {children}
        </motion.div>
      </div>

      {/* Title block in the corner, the way a drawing sheet has one: bottom-right */}
      <div className="pointer-events-none absolute bottom-5 right-5 z-30 hidden divide-x divide-[#f2efe8]/30 border border-[#f2efe8]/30 bg-[#0d2a63]/60 font-mono text-[10px] uppercase tracking-wider text-[#f2efe8]/70 backdrop-blur-sm md:flex">
        <div className="px-3 py-1.5">
          <div className="text-[8px] opacity-60">drawing</div>
          <div className="font-bold text-[#f2efe8]">Marcus Ruud · Life</div>
        </div>
        <div className="px-3 py-1.5">
          <div className="text-[8px] opacity-60">rev</div>
          <div>2026.09</div>
        </div>
        <div className="px-3 py-1.5">
          <div className="text-[8px] opacity-60">scale</div>
          <div className="tabular-nums">{scaleLabel}</div>
        </div>
        <div className="hidden px-3 py-1.5 normal-case tracking-normal lg:block">
          <div className="text-[8px] uppercase tracking-wider opacity-60">controls</div>
          <div>drag to pan · ⌘ + scroll or pinch to zoom · double-click to shake</div>
        </div>
        <div className="pointer-events-auto flex items-center gap-1 px-2" onPointerDown={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => zoomFromCenter(1 / 1.3)} aria-label="Zoom out" className={buttonClass}>
            <Minus size={12} />
          </button>
          <button type="button" onClick={() => zoomFromCenter(1.3)} aria-label="Zoom in" className={buttonClass}>
            <Plus size={12} />
          </button>
          <button type="button" onClick={() => reset()} aria-label="Reset view" className={buttonClass}>
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Phones: the title block is hidden, so the controls stand alone bottom-right */}
      <div className="absolute bottom-4 right-3 z-30 flex items-center gap-1.5 md:hidden" onPointerDown={(e) => e.stopPropagation()}>
        <span className="mr-1.5 font-mono text-[10px] uppercase tracking-wider text-white/50">zoom out, there&apos;s more</span>
        <button type="button" onClick={() => zoomFromCenter(1 / 1.3)} aria-label="Zoom out" className={buttonClass}>
          <Minus size={14} />
        </button>
        <button type="button" onClick={() => zoomFromCenter(1.3)} aria-label="Zoom in" className={buttonClass}>
          <Plus size={14} />
        </button>
        <button type="button" onClick={() => reset()} aria-label="Reset view" className={buttonClass}>
          <RotateCcw size={14} />
        </button>
      </div>
    </CanvasContext.Provider>
  );
}
