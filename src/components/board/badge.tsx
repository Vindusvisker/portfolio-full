"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

// The 3D stack (three, rapier, drei) is split out and fetched after the board
// has painted, so it never delays the first render.
const Lanyard = dynamic(() => import("./lanyard"), { ssr: false });

/** Canvas box, in board pixels. Wide and tall so the badge can swing freely. */
const WIDTH = 720;
const HEIGHT = 1000;
const TOP = -120;

/**
 * The hero: an ID badge on a lanyard, hung from the top edge of the board a
 * little left of center. Real physics, grab it and it swings. The canvas
 * itself is pointer-transparent, so stickers and the board work beneath it;
 * only the card catches the pointer (see lanyard.tsx).
 */
export function Badge() {
  const [stage, setStage] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Phones keep the flat photo sticker instead; no three.js there.
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    setStage(document.querySelector<HTMLElement>("[data-stage]"));
  }, []);

  if (!stage) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="pointer-events-none absolute hidden md:block [&_canvas]:pointer-events-none"
      style={{ left: `calc(25% - ${WIDTH / 2}px)`, top: TOP, width: WIDTH, height: HEIGHT, zIndex: 25 }}
    >
      <Lanyard
        position={[0, 0, 16]}
        hangAt={4.6}
        gravity={[0, -40, 0]}
        frontImage="/lanyard/badge-front.png"
        backImage="/lanyard/badge-back.png"
        lanyardWidth={1.1}
        eventSource={stage}
      />
      <p
        className="pointer-events-none absolute left-1/2 w-max -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45"
        style={{ top: 745 }}
      >
        give it a swing
      </p>
    </motion.div>
  );
}
