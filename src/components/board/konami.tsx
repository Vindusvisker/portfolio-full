"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const SEQUENCE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

/** Every sticker listens for this and does a spin. */
export const SPIN_EVENT = "board:spin";
/** Every sticker listens for this and wobbles. */
export const SHAKE_EVENT = "board:shake";

/**
 * Up, up, down, down, left, right, left, right, B, A.
 * Spins every sticker and hands out an achievement.
 */
export function Konami() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    let progress = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea")) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      progress = key === SEQUENCE[progress] ? progress + 1 : key === SEQUENCE[0] ? 1 : 0;
      if (progress === SEQUENCE.length) {
        progress = 0;
        window.dispatchEvent(new CustomEvent(SPIN_EVENT));
        setUnlocked(true);
        window.setTimeout(() => setUnlocked(false), 3200);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AnimatePresence>
      {unlocked && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 16, scale: 0.9, rotate: -3 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 2 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          className="sticker-edge sticker-edge-thin pointer-events-none fixed bottom-16 left-1/2 z-[60] -translate-x-1/2 rounded-full px-5 py-2 font-mono text-sm font-bold text-black"
          style={{ "--sticker-bg": "#fff" } as React.CSSProperties}
        >
          🏆 achievement unlocked
        </motion.div>
      )}
    </AnimatePresence>
  );
}
