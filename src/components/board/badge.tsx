"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { Component, useEffect, useState, type ReactNode } from "react";

// The 3D stack (three, rapier, drei) is split out and fetched after the board
// has painted, so it never delays the first render.
const Lanyard = dynamic(() => import("./lanyard"), { ssr: false });

/**
 * Canvas box, in board pixels. Wide so the badge can swing freely, and
 * reaching far above the sheet so the strap always runs off the top of the
 * screen, even when the sheet sits low on a tall stage.
 */
const WIDTH = 720;
const HEIGHT = 1400;
const TOP = -520;
/** Where the strap hangs from, in percent of the board width. */
const HANG_X = 22;

/**
 * If the 3D stack fails (chunk didn't load, no WebGL, model 404), render
 * nothing and let the flat stand-in carry the spot for good.
 */
class Quiet extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** The flat stand-in: where the physics card comes to rest, in board units. */
const REST = { x: 21.2, y: 41, w: 277, h: 390 };

/**
 * The hero: an ID badge on a lanyard, hung from the top edge of the board a
 * little left of center. Real physics, grab it and it swings. The canvas
 * itself is pointer-transparent, so stickers and the board work beneath it;
 * only the card catches the pointer (see lanyard.tsx).
 *
 * A flat picture of the badge sits in the same spot from first paint and
 * crossfades out once the 3D one has loaded, so the composition is complete
 * immediately and stays complete if WebGL never shows up.
 */
export function Badge() {
  const [stage, setStage] = useState<HTMLElement | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    // Phones keep the flat photo sticker instead; no three.js there.
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    setStage(document.querySelector<HTMLElement>("[data-stage]"));
  }, []);

  return (
    <>
      {/* Stand-in: strap plus the badge front, static */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute hidden md:block"
        style={{ left: `${REST.x}%`, top: `${REST.y}%`, width: REST.w, height: REST.h, x: "-50%", y: "-50%", zIndex: 24 }}
        initial={{ opacity: 1 }}
        animate={{ opacity: live ? 0 : 1 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: live ? 0.15 : 0 }}
      >
        <div
          className="absolute bottom-full left-1/2 h-[900px] w-[30px] -translate-x-1/2 bg-[#ece8df] shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
          style={{ backgroundImage: "linear-gradient(90deg, rgba(0,0,0,0.12), transparent 30%, transparent 70%, rgba(0,0,0,0.12))" }}
        />
        <div className="absolute left-1/2 top-[-14px] h-[28px] w-[14px] -translate-x-1/2 rounded-full bg-[#222] shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
        <Image
          src="/lanyard/badge-front.png"
          alt=""
          width={REST.w}
          height={REST.h}
          priority
          draggable={false}
          className="h-full w-full rounded-[16px] object-cover shadow-[0_30px_50px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.15)]"
        />
      </motion.div>

      {stage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: live ? 1 : 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="pointer-events-none absolute hidden md:block [&_canvas]:pointer-events-none"
          style={{ left: `calc(${HANG_X}% - ${WIDTH / 2}px)`, top: TOP, width: WIDTH, height: HEIGHT, zIndex: 25 }}
        >
          <Quiet>
            <Lanyard
              position={[0, 0, 22.4]}
              hangAt={3.5}
              gravity={[0, -40, 0]}
              frontImage="/lanyard/badge-front.png"
              backImage="/lanyard/badge-back.png"
              lanyardWidth={1.1}
              eventSource={stage}
              onReady={() => setLive(true)}
            />
          </Quiet>
          <p
            className="pointer-events-none absolute left-1/2 w-max -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45"
            style={{ top: 1125 }}
          >
            give it a swing
          </p>
        </motion.div>
      )}
    </>
  );
}
