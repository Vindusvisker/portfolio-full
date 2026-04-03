"use client";

import { useEffect, useRef } from "react";

export function ScrollRevealText({ children }: { children: string }) {
  const containerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const words = container.querySelectorAll<HTMLSpanElement>("span[data-word]");

    const observer = new IntersectionObserver(
      () => {
        const onScroll = () => {
          const containerRect = container.getBoundingClientRect();
          const viewportHeight = window.innerHeight;

          // Map container position to 0-1 progress
          const start = viewportHeight * 0.85;
          const end = viewportHeight * 0.3;

          words.forEach((word, i) => {
            const wordRect = word.getBoundingClientRect();
            const wordCenter = wordRect.top + wordRect.height / 2;

            // Each word reveals based on its vertical position
            const wordProgress = 1 - (wordCenter - end) / (start - end);
            const clamped = Math.max(0, Math.min(1, wordProgress));

            word.style.opacity = `${0.2 + clamped * 0.8}`;
            word.style.color = clamped > 0.5 ? "var(--foreground)" : "var(--muted-foreground)";
          });
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
      },
      { threshold: 0 }
    );

    observer.observe(container);

    // Initial run
    const event = new Event("scroll");
    window.dispatchEvent(event);

    return () => observer.disconnect();
  }, []);

  const words = children.split(" ");

  return (
    <p ref={containerRef} className="text-base leading-relaxed">
      {words.map((word, i) => (
        <span
          key={i}
          data-word
          className="inline-block transition-all duration-300"
          style={{ color: "var(--muted-foreground)", opacity: 0.2 }}
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </p>
  );
}
