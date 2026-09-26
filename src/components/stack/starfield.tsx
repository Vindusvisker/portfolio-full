"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ROUTE_REVEAL_EVENT, routeCovered, routeRevealedAt } from "@/components/route-transition";

/** Seconds for the warp streaks to settle into still stars */
const SETTLE = 2.2;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

interface Star {
  x: number;
  y: number;
  /** Depth, 0.3 near the back to 1 at the front: drives size, drift and parallax. */
  z: number;
  r: number;
  a: number;
  phase: number;
  speed: number;
}

/**
 * A sparse field of stars on a 2D canvas: slow drift, gentle twinkle and a
 * little parallax against the pointer. Sits behind the globe so it reads as
 * a planet. Static under reduced motion, paused while off screen.
 */
export function Starfield({ className, density = 1 / 6500 }: { className?: string; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ink = getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim() || "#f2efe8";

    let stars: Star[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    // Pointer position in 0..1 and the eased parallax offset it drives.
    let px = 0.5;
    let py = 0.5;
    let ox = 0;
    let oy = 0;
    // Arriving under a route sheet, the field starts at full warp (stars
    // streaking outward from the center) and settles once the sheet lifts.
    // Mounting right after a lift (dev remounts do this) settles from that lift.
    const sinceReveal = performance.now() - routeRevealedAt();
    let settleAt: number | null = routeCovered() ? null : sinceReveal < 600 ? routeRevealedAt() : -Infinity;
    const onReveal = () => {
      if (settleAt == null) settleAt = performance.now();
    };
    window.addEventListener(ROUTE_REVEAL_EVENT, onReveal);

    const seed = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const count = Math.round(w * h * density);
      stars = Array.from({ length: count }, () => {
        const bright = Math.random() < 0.07;
        return {
          x: Math.random(),
          y: Math.random(),
          z: 0.3 + Math.random() * 0.7,
          r: bright ? 1.4 + Math.random() * 0.6 : 0.6 + Math.random() * 0.6,
          a: bright ? 0.75 + Math.random() * 0.25 : 0.28 + Math.random() * 0.45,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 1.4,
        };
      });
    };

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ox += ((0.5 - px) - ox) * 0.04;
      oy += ((0.5 - py) - oy) * 0.04;
      const drift = reduce ? 0 : t * 0.0025;
      const warp = reduce ? 0 : settleAt == null ? 1 : 1 - easeOut(Math.min(1, (t - settleAt) / (SETTLE * 1000)));
      const cx = w / 2;
      const cy = h / 2;
      ctx.fillStyle = ink;
      ctx.strokeStyle = ink;
      ctx.lineCap = "round";
      for (const s of stars) {
        const twinkle = reduce ? 1 : 0.7 + 0.3 * Math.sin(t * 0.001 * s.speed + s.phase);
        const x = (((s.x * w + drift * s.z + ox * 28 * s.z) % w) + w) % w;
        const y = s.y * h + oy * 18 * s.z;
        const r = s.r * (0.6 + 0.4 * s.z);
        ctx.globalAlpha = s.a * twinkle;
        if (warp > 0.005) {
          // Streak away from the center; longer for nearer stars and further out.
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.hypot(dx, dy) || 1;
          const len = warp * warp * (60 + dist * 0.45) * s.z;
          ctx.lineWidth = r * 1.6;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + (dx / dist) * len, y + (dy / dist) * len);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      raf = 0;
      if (!visible) return;
      draw(t);
      if (!reduce) raf = requestAnimationFrame(loop);
    };
    const onRevealStart = () => start();
    window.addEventListener(ROUTE_REVEAL_EVENT, onRevealStart);
    const start = () => {
      if (!raf && visible) raf = requestAnimationFrame(loop);
    };

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      px = (e.clientX - r.left) / Math.max(1, r.width);
      py = (e.clientY - r.top) / Math.max(1, r.height);
      if (reduce) start();
    };

    seed();
    start();

    const ro = new ResizeObserver(() => {
      seed();
      if (reduce) start();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);
    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener(ROUTE_REVEAL_EVENT, onReveal);
      window.removeEventListener(ROUTE_REVEAL_EVENT, onRevealStart);
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden="true" className={cn("starfield", className)} />;
}
