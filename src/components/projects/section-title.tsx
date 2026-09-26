"use client";

import { useEffect, useReducer, useRef, useState } from "react";

/**
 * One fixed headline for the whole page. Sections declare their line with
 * `data-section-title`, and as each one scrolls past the top third of the
 * viewport the headline erases and retypes itself, glyph by glyph.
 */
export function SectionTitle({ initial, className = "" }: { initial: string; className?: string }) {
  const [target, setTarget] = useState(initial);
  const anim = useRef({ shown: initial, count: initial.length });
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  // Pick the active section from scroll position.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-section-title]"));
    if (els.length === 0) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.38;
      let active = els[0];
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) active = el;
      }
      const next = active.dataset.sectionTitle ?? "";
      setTarget((t) => (t === next ? t : next));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Erase the old line quickly, type the new one a little slower.
  useEffect(() => {
    const a = anim.current;
    if (a.shown === target && a.count === target.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      a.shown = target;
      a.count = target.length;
      rerender();
      return;
    }
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const tick = (now: number) => {
      acc += now - last;
      last = now;
      let changed = false;
      if (a.shown !== target) {
        while (acc >= 4 && a.count > 0) {
          a.count -= 1;
          acc -= 4;
          changed = true;
        }
        if (a.count === 0) {
          a.shown = target;
          acc = 0;
          changed = true;
        }
      } else {
        while (acc >= 16 && a.count < a.shown.length) {
          a.count += 1;
          acc -= 16;
          changed = true;
        }
      }
      if (changed) rerender();
      if (a.shown !== target || a.count < a.shown.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const { shown, count } = anim.current;

  return (
    <h1
      className={`pointer-events-none fixed left-5 top-[72px] z-30 max-w-[min(26em,calc(100vw-2.5rem))] font-display text-xl font-semibold uppercase leading-none tracking-wide text-white mix-blend-difference md:left-8 md:top-4 md:flex md:min-h-[44px] md:max-w-[min(30em,calc(100vw-24rem))] md:items-center md:text-[26px] ${className}`}
      aria-live="polite"
    >
      <span className="sr-only">{target}</span>
      <span aria-hidden="true">
        {shown.split("").map((ch, i) => (
          <span
            key={`${i}-${ch}`}
            className={i < count ? "opacity-100" : "opacity-0"}
            style={{ transition: "opacity 90ms ease-out" }}
          >
            {ch}
          </span>
        ))}
      </span>
    </h1>
  );
}
