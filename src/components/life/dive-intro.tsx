"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ROUTE_REVEAL_EVENT, routeCovered } from "@/components/route-transition";

/**
 * The Life intro: the dive plays once, muted, and when it rests on the sea
 * floor the board pops out of the sand on top of the frozen last frame.
 * Phones and reduced motion get the ending frame straight away, and a
 * Skip chip appears after a second. Nothing on the board takes the pointer
 * until it has landed.
 */

/** Screens that never play the intro. Must match the media list under ".life-intro" in globals.css. */
const STILL_ONLY = ["(max-width: 720px)", "(prefers-reduced-motion: reduce)"];
/** If the video has not ended by then, land anyway. */
const SAFETY_MS = 9000;
/** Seconds of video during which the greeting sits over the water; it cuts just before the splash. */
const GREETING = { from: 0.35, to: 2.45 };
/** Set on <html> while the dive plays so the site chrome (nav, brand) stays out of the frame. */
const INTRO_ATTR = "data-intro";
/**
 * The dive belongs to a fresh load. Arriving from Work or Stack through the
 * route sheet lands straight on the sea floor; this flips once the first
 * mount in this document has run.
 */
let firstMount = true;

export function DiveIntro({
  src,
  poster,
  ending,
  children,
}: {
  src: string;
  poster: string;
  ending: string;
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const greetingRef = useRef<HTMLParagraphElement>(null);
  const landRef = useRef<() => void>(() => {});
  const [landed, setLanded] = useState(false);
  const [stillOnly, setStillOnly] = useState(false);
  const [skippable, setSkippable] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;
    let done = false;

    const land = () => {
      if (done) return;
      done = true;
      document.documentElement.removeAttribute(INTRO_ATTR);
      greetingRef.current?.classList.remove("on");
      // Stagger the pop-out per board child; the same delay seeds each one's bob.
      const world = root.querySelector<HTMLElement>("[data-world]");
      if (world) {
        Array.from(world.children).forEach((el, i) => {
          (el as HTMLElement).style.setProperty("--d", `${(i % 14) * 55}ms`);
        });
      }
      setLanded(true);
    };
    landRef.current = land;

    // The dive plays on every fresh load, by request. Phones, reduced motion
    // and client-side arrivals (from Work or Stack) get the ending frame only;
    // the video is never assigned a source, so nothing is downloaded.
    const fresh = firstMount;
    firstMount = false;
    if (!fresh || routeCovered() || STILL_ONLY.some((q) => window.matchMedia(q).matches)) {
      setStillOnly(true);
      if (routeCovered()) {
        // Under a route sheet: pop the board out as the sheet lifts, not before.
        window.addEventListener(ROUTE_REVEAL_EVENT, land, { once: true });
        return () => window.removeEventListener(ROUTE_REVEAL_EVENT, land);
      }
      land();
      return;
    }

    // Only the play path loads anything: poster first, then the clip.
    video.poster = poster;
    video.src = src;
    document.documentElement.setAttribute(INTRO_ATTR, "");
    const onEnded = () => land();
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onEnded);
    const safety = window.setTimeout(land, SAFETY_MS);
    const skipTimer = window.setTimeout(() => setSkippable(true), 1200);

    // The greeting follows the video's clock, polled per frame and written only on change.
    let raf = 0;
    let shown = false;
    const follow = () => {
      if (done) return;
      const t = video.currentTime;
      const want = t >= GREETING.from && t < GREETING.to;
      if (want !== shown) {
        shown = want;
        greetingRef.current?.classList.toggle("on", want);
      }
      raf = requestAnimationFrame(follow);
    };
    raf = requestAnimationFrame(follow);
    video.play().catch(onEnded);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.removeAttribute(INTRO_ATTR);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onEnded);
      window.clearTimeout(safety);
      window.clearTimeout(skipTimer);
    };
  }, [src, poster]);

  const skip = () => {
    const v = videoRef.current;
    if (v && Number.isFinite(v.duration) && v.duration > 0) {
      v.pause();
      v.currentTime = v.duration;
    }
    landRef.current();
  };

  return (
    <div ref={rootRef} className={cn("life-intro", landed && "landed", stillOnly && "still-only")}>
      {/* No src or poster in markup: the effect assigns them only when the dive will actually play */}
      <video ref={videoRef} className="life-intro-video" muted playsInline preload="none" aria-hidden="true" tabIndex={-1} />
      <div className="life-intro-still" aria-hidden="true" style={{ backgroundImage: `url('${ending}')` }} />
      {/* The greeting over the water, gone before the splash */}
      <p ref={greetingRef} className="life-greeting font-display" aria-hidden="true">
        Hey, I&apos;m Marcus!
      </p>
      <div className="life-board">{children}</div>
      {!landed && skippable && (
        <button type="button" className="life-skip chip" onClick={skip}>
          Skip the dive ↓
        </button>
      )}
    </div>
  );
}
