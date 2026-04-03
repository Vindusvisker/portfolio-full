"use client";

import { useEffect, useRef } from "react";

export function ScrollRevealText({ children }: { children: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const words = container.querySelectorAll<HTMLSpanElement>("span[data-word]");
    const totalWords = words.length;

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const viewportH = window.innerHeight;

      // Progress: 0 when container top hits 35% of viewport, 1 when container top nears top
      const progress = 1 - rect.top / (viewportH * 0.35);
      const clamped = Math.max(0, Math.min(1, progress));

      // Spread words across the progress range
      words.forEach((word, i) => {
        const wordStart = i / totalWords;
        const wordEnd = (i + 1) / totalWords;
        const wordProgress = Math.max(0, Math.min(1, (clamped - wordStart) / (wordEnd - wordStart)));

        if (wordProgress > 0.5) {
          word.style.color = "var(--foreground)";
        } else {
          word.style.color = "#1e1e1e";
        }
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const words = children.split(" ");

  return (
    <div ref={containerRef} className="text-2xl font-bold leading-snug md:text-4xl">
      {words.map((word, i) => (
        <span
          key={i}
          data-word
          className="inline-block transition-colors duration-150"
          style={{ color: "#1e1e1e" }}
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </div>
  );
}
