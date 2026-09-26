"use client";

import { useEffect, useRef } from "react";

/**
 * Muted, looping, inline video. The muted flag is set from JS because React
 * does not serialise it into the HTML, and browsers refuse to autoplay
 * before hydration without it.
 */
export function AutoVideo({ src, poster, className }: { src: string; poster?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.play().catch(() => {});
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      className={className}
      aria-hidden="true"
    />
  );
}
