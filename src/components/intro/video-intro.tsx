"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ROUTE_REVEAL_EVENT, coverRoute, revealRoute, routeCovered } from "@/components/route-transition";

/**
 * A page intro: one short clip plays once, muted, on a fresh load, with a
 * greeting over it, then the page lands: the clip's last frame stays as the
 * floor and the children pop out on top of it. While it plays it covers the route (see coverRoute), so everything that
 * waits for a route reveal waits for the intro to land. Phones and reduced
 * motion skip it; arrivals through the route switch skip it unless the page
 * sets playOnArrival. A Skip chip appears after a second.
 */

/** Screens that never play the intro. Must match the media list under ".video-intro" in globals.css. */
const STILL_ONLY = ["(max-width: 720px)", "(prefers-reduced-motion: reduce)"];
/** If the video has not ended by then, land anyway; re-armed from the clip's real duration once known. */
const SAFETY_MS = 20000;
const SAFETY_SLACK_MS = 2500;
/** Default seconds of video during which the greeting shows. */
const GREETING_DEFAULT = { from: 0.35, to: 2.45 };
/** Set on <html> while the dive plays so the site chrome (nav, brand) stays out of the frame. */
const INTRO_ATTR = "data-intro";
/**
 * The dive belongs to a fresh load. Arriving from Work or Stack through the
 * route sheet lands straight on the sea floor; this flips once the first
 * mount in this document has run.
 */
let firstMount = true;

export interface VideoIntroProps {
  src: string;
  poster: string;
  /** The last frame, full quality: shown to anyone who skips the clip and faded in over the clip's last frame. */
  ending: string;
  /** The line that sits over the footage, if any, and when (seconds of video). */
  greeting?: string;
  greetingWindow?: { from: number; to: number };
  /** Also play when arriving through the route switch, not only on a fresh load. Work wants this; Life does not. */
  playOnArrival?: boolean;
  /** Seconds before the clip's end to freeze and land, when the true last frame is not the floor you want. */
  stopBeforeEnd?: number;
  children: React.ReactNode;
}

export function VideoIntro({
  src,
  poster,
  ending,
  greeting,
  greetingWindow = GREETING_DEFAULT,
  playOnArrival = false,
  stopBeforeEnd = 0,
  children,
}: VideoIntroProps) {
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

    let covering = false;
    const land = (reason = "unknown") => {
      if (done) return;
      done = true;
      document.documentElement.removeAttribute(INTRO_ATTR);
      greetingRef.current?.classList.remove("on");
      if (covering) {
        covering = false;
        revealRoute();
      }
      // Stagger the pop-out per board child; the same delay seeds each one's bob.
      const world = root.querySelector<HTMLElement>("[data-world]");
      if (world) {
        Array.from(world.children).forEach((el, i) => {
          (el as HTMLElement).style.setProperty("--d", `${(i % 14) * 55}ms`);
        });
      }
      setLanded(true);
    };
    landRef.current = () => land("skip");

    // Phones and reduced motion get the ending frame only, and the video is
    // never assigned a source, so nothing is downloaded. A fresh load plays;
    // an arrival through the route switch plays only where the page asks.
    const fresh = firstMount;
    firstMount = false;
    const stillOnly = STILL_ONLY.some((q) => window.matchMedia(q).matches);
    if (stillOnly || (!fresh && !playOnArrival)) {
      setStillOnly(true);
      if (routeCovered()) {
        // Under a route sheet: land as the sheet lifts, not before.
        const onReveal = () => land("still-only, sheet lifted");
        window.addEventListener(ROUTE_REVEAL_EVENT, onReveal, { once: true });
        return () => window.removeEventListener(ROUTE_REVEAL_EVENT, onReveal);
      }
      land("still-only");
      return;
    }

    let raf = 0;
    let safety = 0;
    let skipTimer = 0;
    const onEnded = (e?: Event | unknown) => land(e instanceof Event ? `video ${e.type}` : "play() rejected");
    const start = () => {
      if (done) return;
      // Only the play path loads anything: poster first, then the clip. The
      // effect can run twice on a client-side arrival, so an identical source
      // is left alone: re-assigning it would abort the play already under way.
      if (video.getAttribute("poster") !== poster) video.poster = poster;
      if (video.getAttribute("src") !== src) video.src = src;
      document.documentElement.setAttribute(INTRO_ATTR, "");
      // Cover the route for the clip's duration, so the page's own arrivals wait for the landing.
      covering = true;
      coverRoute();
      video.addEventListener("ended", onEnded);
      video.addEventListener("error", onEnded);
      safety = window.setTimeout(() => land("safety timeout"), SAFETY_MS);
      const armSafety = () => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) return;
        window.clearTimeout(safety);
        safety = window.setTimeout(() => land("safety timeout"), video.duration * 1000 + SAFETY_SLACK_MS);
      };
      video.addEventListener("loadedmetadata", armSafety, { once: true });
      armSafety();
      skipTimer = window.setTimeout(() => setSkippable(true), 1200);

      // The greeting follows the video's clock, polled per frame and written only
      // on change; the same loop freezes the clip early when the page asks for it.
      let shown = false;
      const follow = () => {
        if (done) return;
        const t = video.currentTime;
        if (stopBeforeEnd > 0 && Number.isFinite(video.duration) && t >= video.duration - stopBeforeEnd) {
          video.pause();
          land("stopBeforeEnd");
          return;
        }
        const want = t >= greetingWindow.from && t < greetingWindow.to;
        if (want !== shown) {
          shown = want;
          greetingRef.current?.classList.toggle("on", want);
        }
        raf = requestAnimationFrame(follow);
      };
      raf = requestAnimationFrame(follow);
      video.play().catch((err: unknown) => {
        // An aborted play (a second load, a fast navigation) is not a failure; a blocked one is.
        if ((err as { name?: string })?.name === "AbortError") return;
        onEnded(err);
      });
    };

    // Arriving under a route sheet, the clip starts from its first frame the moment the sheet lifts.
    if (routeCovered()) window.addEventListener(ROUTE_REVEAL_EVENT, start, { once: true });
    else start();

    return () => {
      window.removeEventListener(ROUTE_REVEAL_EVENT, start);
      cancelAnimationFrame(raf);
      document.documentElement.removeAttribute(INTRO_ATTR);
      if (covering) revealRoute();
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onEnded);
      window.clearTimeout(safety);
      window.clearTimeout(skipTimer);
    };
  }, [src, poster, greetingWindow.from, greetingWindow.to, playOnArrival, stopBeforeEnd]);

  const skip = () => {
    const v = videoRef.current;
    if (v && Number.isFinite(v.duration) && v.duration > 0) {
      v.pause();
      v.currentTime = Math.max(0, v.duration - stopBeforeEnd);
    }
    landRef.current();
  };

  return (
    <div
      ref={rootRef}
      className={cn("video-intro is-surface", landed && "landed", stillOnly && "still-only")}
    >
      {/* No src or poster in markup: the effect assigns them only when the clip will actually play */}
      <video ref={videoRef} className="video-intro-video" muted playsInline preload="none" aria-hidden="true" tabIndex={-1} />
      <div className="video-intro-still" aria-hidden="true" style={{ backgroundImage: `url('${ending}')` }} />
      {greeting && (
        <p ref={greetingRef} className="video-intro-greeting font-display" aria-hidden="true">
          {greeting}
        </p>
      )}
      <div className="video-intro-board">{children}</div>
      {!landed && skippable && (
        <button type="button" className="video-intro-skip chip" onClick={skip}>
          Skip the intro ↓
        </button>
      )}
    </div>
  );
}
