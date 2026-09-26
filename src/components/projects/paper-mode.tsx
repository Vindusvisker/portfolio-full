"use client";

import { useEffect } from "react";

/**
 * Flips the whole page into paper mode (cream page, ink text) once the
 * element with `targetId` has scrolled into the lower part of the viewport,
 * and back to dark when it scrolls out above. Cleans up on unmount so other
 * pages stay dark.
 */
export function PaperMode({ targetId }: { targetId: string }) {
  useEffect(() => {
    const root = document.documentElement;
    const target = document.getElementById(targetId);
    if (!target) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const on = target.getBoundingClientRect().top <= window.innerHeight * 0.2;
      root.classList.toggle("paper", on);
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
      root.classList.remove("paper");
    };
  }, [targetId]);
  return null;
}
