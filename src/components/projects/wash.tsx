"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Per-project colour plate behind the gallery. A sticky, viewport-tall layer
 * holds one flat colour per project, sampled from its screenshot. As an item
 * scrolls into focus its plate comes up; every plate up to the active one
 * stays opaque so a crossfade never lets the page show through.
 *
 * Items are found by `data-wash-index` on the gallery items. The plate only
 * shows while the sticky layer is pinned, and the section is flagged with
 * `data-wash="on"` so its copy can flip to light.
 */
export function Wash({ colors }: { colors: string[] }) {
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
      // and unpins when its bottom reaches the viewport bottom. The plate is
      // up exactly between those, with a little slack against flicker.
      const was = onRef.current;
      const pinned = rect.top <= (was ? SLACK : 0);
      const released = rect.bottom <= vh - (was ? 0 : SLACK);
      onRef.current = pinned && !released;
      setOn(onRef.current);
      section.dataset.wash = onRef.current ? "on" : "off";
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
        {colors.map((c, i) => (
          <div
            key={`${c}-${i}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${i <= active ? "opacity-100" : "opacity-0"}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <div className="paper-grain absolute inset-0 opacity-40 mix-blend-overlay" />
      </div>
    </div>
  );
}
