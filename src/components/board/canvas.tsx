"use client";

import { animate, motion, useMotionTemplate, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
const GRID = 48;
/** Screens at least this wide start zoomed out a little, so the whole board fits. */
const LARGE_SCREEN = "(min-width: 1024px)";
const LARGE_SCREEN_SCALE = 0.8;

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
 * page, and a single finger on touch still scrolls too.
 */
export function Canvas({ children }: CanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const s = useMotionValue(1);
  const transform = useMotionTemplate`translate(${x}px, ${y}px) scale(${s})`;
  // The grid is painted on the untransformed stage and simply follows the view,
  // which keeps the composited layer viewport-sized no matter how far you pan.
  const gridSize = useTransform(s, (v) => `${GRID * v}px ${GRID * v}px`);
  const gridPosition = useMotionTemplate`${x}px ${y}px`;

  /** The "home" view that reset returns to */
  const home = useRef({ x: 0, y: 0, s: 1 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const last = useRef<{ cx: number; cy: number; dist: number } | null>(null);
  const [panning, setPanning] = useState(false);

  /** Keep at least 30% of the world inside the stage on each axis. */
  const clampPan = useCallback((nx: number, ny: number, ns: number) => {
    const el = stageRef.current;
    if (!el) return { x: nx, y: ny };
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    const minX = 0.3 * vw - vw * ns;
    const maxX = 0.7 * vw;
    const minY = 0.3 * vh - vh * ns;
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

  // Pick the home view for this screen size and settle into it on load.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const mq = window.matchMedia(LARGE_SCREEN);
    const apply = (settle: boolean) => {
      const hs = mq.matches ? LARGE_SCREEN_SCALE : 1;
      // Zoom about the middle of the stage so the board stays centered.
      home.current = {
        x: (el.clientWidth / 2) * (1 - hs),
        y: (el.clientHeight / 2) * (1 - hs),
        s: hs,
      };
      if (settle) reset(0.6);
    };
    apply(true);
    const onChange = () => apply(true);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
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
    if (e.pointerType !== "touch" || pointers.current.size >= 2) setPanning(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId) || !last.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const count = pointers.current.size;
    // One finger on touch is left to the browser for page scrolling.
    if (e.pointerType === "touch" && count < 2) return;

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
    "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black text-white transition-colors hover:border-white hover:bg-white hover:text-black md:h-9 md:w-9";

  return (
    <CanvasContext.Provider value={{ scale: s }}>
      <div
        ref={stageRef}
        data-stage=""
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        className={`absolute inset-0 select-none overflow-hidden ${panning ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ touchAction: "pan-y" }}
      >
        <div aria-hidden="true" className="board-glow pointer-events-none absolute inset-0" />
        <motion.div
          aria-hidden="true"
          className="board-grid pointer-events-none absolute inset-0"
          style={{ backgroundSize: gridSize, backgroundPosition: gridPosition }}
        />
        <motion.div className="absolute inset-0 origin-top-left" style={{ transform }}>
          {children}
        </motion.div>
      </div>

      <p className="pointer-events-none absolute bottom-5 left-5 z-30 hidden font-mono text-xs text-white/40 md:block">
        drag to pan · ⌘ + scroll or pinch to zoom
      </p>
      <div
        className="absolute right-3 top-14 z-30 flex items-center gap-1.5 md:bottom-5 md:right-5 md:top-auto"
        onPointerDown={(e) => e.stopPropagation()}
      >
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
