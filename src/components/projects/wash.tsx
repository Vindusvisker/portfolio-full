"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Per-project background for the gallery. A sticky, viewport-tall layer
 * behind the section holds a pre-blurred thumb of each project's screenshot.
 * As an item scrolls into focus its wash comes up; every wash up to the active
 * one stays opaque so a crossfade never lets the page show through.
 *
 * Items are found by `data-wash-index` on the gallery items. The wash only
 * shows while the section is on screen, so the page is plain black before
 * and after it.
 */
export function Wash({ srcs, dim = 0.45 }: { srcs: { sm: string; lg: string }[]; dim?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [on, setOn] = useState(false);
  const onRef = useRef(false);
  const SLACK = 32;

  useEffect(() => {
    const layer = ref.current;
    const section = layer?.parentElement;
    if (!layer || !section) return;
    const items = Array.from(section.querySelectorAll<HTMLElement>("[data-wash-index]"));
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const rect = section.getBoundingClientRect();
      // The sticky layer pins when the section's top reaches the viewport top
      // and unpins when its bottom reaches the viewport bottom. The wash is
      // up exactly between those, with a little slack against flicker.
      const was = onRef.current;
      const pinned = rect.top <= (was ? SLACK : 0);
      const released = rect.bottom <= vh - (was ? 0 : SLACK);
      onRef.current = pinned && !released;
      setOn(onRef.current);
      const line = vh * 0.6;
      let idx = 0;
      for (const el of items) {
        if (el.getBoundingClientRect().top <= line) idx = Number(el.dataset.washIndex ?? 0);
      }
      setActive(idx);
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

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-clip">
      <div
        className={`sticky top-0 h-lvh w-full overflow-hidden transition-opacity duration-700 ease-out ${
          on ? "opacity-100" : "opacity-0"
        }`}
      >
        {srcs.map((s, i) => (
          <picture key={s.lg}>
            <source media="(min-width: 1024px)" srcSet={s.lg} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.sm}
              alt=""
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out ${
                i <= active ? "opacity-100" : "opacity-0"
              }`}
            />
          </picture>
        ))}
        <div className="absolute inset-0 bg-background" style={{ opacity: dim }} />
        <div
          className="absolute inset-0 hidden lg:block"
          style={{ background: "radial-gradient(130% 120% at 35% 25%, transparent 35%, rgba(5,5,5,0.5) 100%)" }}
        />
        <div
          className="absolute inset-0 hidden opacity-50 mix-blend-overlay lg:block"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>
    </div>
  );
}
