"use client";

import { useEffect, useRef } from "react";

// Parses text with [label](url) markdown-style links into tokens
function parseTokens(text: string): { word: string; href?: string }[] {
  const tokens: { word: string; href?: string }[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Plain words before the link
    const before = text.slice(lastIndex, match.index).trim();
    if (before) {
      for (const w of before.split(/\s+/)) tokens.push({ word: w });
    }
    // Link words
    const linkWords = match[1].split(/\s+/);
    linkWords.forEach((w) => tokens.push({ word: w, href: match![2] }));
    lastIndex = regex.lastIndex;
  }

  // Remaining plain words
  const remaining = text.slice(lastIndex).trim();
  if (remaining) {
    for (const w of remaining.split(/\s+/)) tokens.push({ word: w });
  }

  return tokens;
}

const LINK_COLOR = "#a8c7d4";
const CTA_LINK_COLOR = "#b5d4a8";
const MUTED_COLOR = "#1e1e1e";

export function ScrollRevealText({ children }: { children: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const words = container.querySelectorAll<HTMLElement>("[data-word]");
    const totalWords = words.length;

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const viewportH = window.innerHeight;

      const progress = 1 - rect.top / (viewportH * 0.66);
      const clamped = Math.max(0, Math.min(1, progress));

      words.forEach((word, i) => {
        const wordStart = i / totalWords;
        const wordEnd = (i + 1) / totalWords;
        const wordProgress = Math.max(0, Math.min(1, (clamped - wordStart) / (wordEnd - wordStart)));
        const linkType = word.dataset.link;

        if (wordProgress > 0.5) {
          word.style.color = linkType === "cta" ? CTA_LINK_COLOR : linkType === "true" ? LINK_COLOR : "var(--foreground)";
        } else {
          word.style.color = MUTED_COLOR;
        }
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const paragraphs = children.split("\n");

  return (
    <div ref={containerRef} className="space-y-6 text-2xl font-bold leading-snug md:text-4xl">
      {paragraphs.map((para, pi) => {
        const tokens = parseTokens(para.trim());
        return (
          <p key={pi}>
            {tokens.map((token, wi) =>
              token.href ? (
                <span key={`${pi}-${wi}`} className="inline-block">
                  <a
                    href={token.href}
                    target={token.href.startsWith("/") ? undefined : "_blank"}
                    rel={token.href.startsWith("/") ? undefined : "noopener noreferrer"}
                    data-word
                    data-link={token.href.startsWith("/") ? "cta" : "true"}
                    className="underline underline-offset-4 transition-colors duration-150 cursor-pointer"
                    style={{ color: MUTED_COLOR }}
                  >
                    {token.word}
                  </a>
                  {"\u00A0"}
                </span>
              ) : (
                <span
                  key={`${pi}-${wi}`}
                  data-word
                  className="inline-block transition-colors duration-150"
                  style={{ color: MUTED_COLOR }}
                >
                  {token.word}
                  {"\u00A0"}
                </span>
              )
            )}
          </p>
        );
      })}
    </div>
  );
}
