"use client";

import Image from "next/image";
import { AnimatePresence, motion, useAnimate, useMotionValue } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SHAKE_EVENT, SPIN_EVENT } from "./konami";
import { cn } from "@/lib/utils";
import { useBubbles } from "./bubbles";
import { useCanvasScale } from "./canvas";

export interface StickerPosition {
  /** Center of the sticker, in percent of the board width */
  x: number;
  /** Center of the sticker, in percent of the board height */
  y: number;
  rotate?: number;
}

interface StickerProps {
  desktop: StickerPosition;
  /** Position on small screens. Omit to hide the sticker on mobile. */
  mobile?: StickerPosition;
  z?: number;
  href?: string;
  label?: string;
  /** Speech bubble shown when the sticker is tapped. Needs an `id`. */
  bubble?: React.ReactNode;
  id?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * A draggable sticker pinned to the board. Rendered once per breakpoint so
 * positions can differ between phone and desktop without a resize listener.
 */
export function Sticker({ desktop, mobile, z = 10, href, label, bubble, id, className, children }: StickerProps) {
  const shared = { z, href, label, bubble };
  return (
    <>
      <Pinned pos={desktop} id={id && `${id}-desktop`} {...shared} className={cn("hidden md:block", className)}>
        {children}
      </Pinned>
      {mobile && (
        <Pinned pos={mobile} id={id && `${id}-mobile`} {...shared} className={cn("md:hidden", className)}>
          {children}
        </Pinned>
      )}
    </>
  );
}

function Pinned({
  pos,
  z,
  href,
  label,
  bubble,
  id,
  className,
  children,
}: {
  pos: StickerPosition;
  z: number;
  href?: string;
  label?: string;
  bubble?: React.ReactNode;
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const scale = useCanvasScale();
  const bubbles = useBubbles();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [fxRef, fx] = useAnimate();

  // Board-wide effects: Konami spins everything, a double-click shakes it.
  useEffect(() => {
    const spin = () => {
      const el = fxRef.current;
      if (!el) return;
      fx(el, { rotate: [0, 360], scale: [1, 1.25, 1] }, { duration: 0.7, delay: Math.random() * 0.5, ease: [0.3, 0, 0.2, 1] }).then(
        () => fx(el, { rotate: 0 }, { duration: 0 })
      );
    };
    const shake = () => {
      const el = fxRef.current;
      if (!el) return;
      const amp = 4 + Math.random() * 6;
      fx(
        el,
        { x: [0, -amp, amp, -amp * 0.6, amp * 0.6, 0], rotate: [0, -5, 5, -3, 3, 0] },
        { duration: 0.55, delay: Math.random() * 0.15, ease: "easeInOut" }
      );
    };
    window.addEventListener(SPIN_EVENT, spin);
    window.addEventListener(SHAKE_EVENT, shake);
    return () => {
      window.removeEventListener(SPIN_EVENT, spin);
      window.removeEventListener(SHAKE_EVENT, shake);
    };
  }, [fx, fxRef]);
  const hasBubble = Boolean(bubble && id);
  const isOpen = hasBubble && bubbles.openId === id;
  const dx = useMotionValue(0);
  const dy = useMotionValue(0);
  const drag = useRef<{ px: number; py: number; ox: number; oy: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState(false);
  const external = href?.startsWith("http") || href?.endsWith(".pdf");

  // Drag is tracked on window rather than with pointer capture: capture would
  // retarget the pointer-up to the wrapper and the click would never reach a
  // link inside the sticker.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Keep the canvas from panning while a sticker is being moved.
    e.stopPropagation();
    if (e.button !== 0 && e.pointerType === "mouse") return;
    drag.current = { px: e.clientX, py: e.clientY, ox: dx.get(), oy: dy.get(), moved: false };
    setDragging(true);

    const onMove = (ev: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const k = scale?.get() ?? 1;
      const mx = (ev.clientX - d.px) / k;
      const my = (ev.clientY - d.py) / k;
      if (Math.abs(mx) + Math.abs(my) > 3) d.moved = true;
      dx.set(d.ox + mx);
      dy.set(d.oy + my);
    };
    const onEnd = () => {
      suppressClick.current = drag.current?.moved ?? false;
      drag.current = null;
      setDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      // Let the click that follows this pointer-up be judged, then reset.
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  };

  const onClick = () => {
    if (suppressClick.current || !hasBubble || !id) return;
    bubbles.toggle(id);
  };

  const rotate = pos.rotate ?? 0;

  return (
    <div
      className={cn("absolute", className)}
      data-bubble-root={hasBubble ? "" : undefined}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        zIndex: isOpen ? 40 : dragging ? 30 : z,
        transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
      }}
    >
      <motion.div
        ref={bodyRef}
        style={{ x: dx, y: dy }}
        animate={{ scale: dragging ? 1.1 : 1 }}
        whileHover={dragging ? undefined : { scale: 1.06, rotate: rotate ? -rotate * 0.25 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onPointerDown={onPointerDown}
        onClick={onClick}
        role={hasBubble ? "button" : undefined}
        aria-label={hasBubble ? label : undefined}
        tabIndex={hasBubble ? 0 : undefined}
        aria-expanded={hasBubble ? isOpen : undefined}
        onKeyDown={(e) => {
          if (hasBubble && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick();
          }
        }}
        className={cn("touch-none select-none", dragging ? "cursor-grabbing" : hasBubble ? "cursor-pointer" : "cursor-grab")}
      >
        <div ref={fxRef}>
        {href ? (
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            aria-label={label}
            draggable={false}
            onClick={(e) => {
              if (suppressClick.current) e.preventDefault();
            }}
            className="block"
          >
            {children}
          </a>
        ) : (
          children
        )}
        </div>
      </motion.div>

      {hasBubble && (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2"
          style={{ x: dx, y: dy, rotate: -rotate }}
        >
          <Bubble open={isOpen} pos={pos} anchor={bodyRef}>
            {bubble}
          </Bubble>
        </motion.div>
      )}
    </div>
  );
}

type Side = "top" | "bottom";
type Align = "left" | "center" | "right";
const TAIL_INSET = 28;
const EDGE = 10;

/**
 * Speech bubble. When it opens it measures where the sticker actually sits
 * on screen (zoom and pan included) and flips side or alignment so the
 * bubble stays inside the board.
 */
function Bubble({
  open,
  pos,
  anchor,
  children,
}: {
  open: boolean;
  pos: StickerPosition;
  anchor: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  const [placement, setPlacement] = useState<{ side: Side; align: Align; gap: number }>({
    side: pos.y < 28 ? "bottom" : "top",
    align: pos.x < 22 ? "left" : pos.x > 78 ? "right" : "center",
    gap: 46,
  });

  useLayoutEffect(() => {
    if (!open) return;
    const el = anchor.current;
    const stage = el?.closest<HTMLElement>("[data-stage]");
    if (!el || !stage) return;
    const a = el.getBoundingClientRect();
    const st = stage.getBoundingClientRect();
    const cx = a.left + a.width / 2 - st.left;
    const bubbleW = Math.min(300, st.width * 0.78);
    const bubbleH = 200; // generous estimate, real height varies with copy
    const align: Align =
      cx - bubbleW / 2 < EDGE ? "left" : cx + bubbleW / 2 > st.width - EDGE ? "right" : "center";
    const spaceAbove = a.top - st.top;
    const side: Side = spaceAbove < bubbleH + 60 ? "bottom" : "top";
    setPlacement({ side, align, gap: a.height / 2 + 16 });
  }, [open, anchor]);

  const { side, align, gap } = placement;
  const shift =
    align === "center" ? "translateX(-50%)" : align === "left" ? `translateX(-${TAIL_INSET}px)` : `translateX(calc(-100% + ${TAIL_INSET}px))`;

  return (
    <AnimatePresence>
      {open && (
        <div
          className="absolute left-0 w-[min(300px,78vw)]"
          style={{ [side === "top" ? "bottom" : "top"]: gap, transform: shift }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: side === "top" ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: side === "top" ? 6 : -6 }}
            transition={{ type: "spring", stiffness: 520, damping: 32 }}
            style={{
              transformOrigin: `${align === "center" ? "50%" : align === "left" ? `${TAIL_INSET}px` : `calc(100% - ${TAIL_INSET}px)`} ${side === "top" ? "100%" : "0%"}`,
            }}
            className="panel-edge pointer-events-auto relative rounded-2xl bg-black px-5 py-4 text-center font-mono text-base font-bold leading-snug text-white"
          >
            {children}
            <span
              aria-hidden="true"
              className={cn(
                "absolute h-4 w-4 rotate-45 bg-black",
                side === "top" ? "-bottom-[9px] border-b border-r border-[#f4f1ea]/70" : "-top-[9px] border-l border-t border-[#f4f1ea]/70",
                align === "center" ? "left-1/2 -translate-x-1/2" : align === "left" ? "left-5" : "right-5"
              )}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Ready-made sticker looks ---------- */

/** White die-cut chip holding a logo */
export function LogoChip({
  children,
  size = 64,
  color = "#000",
  bg = "#fff",
  className,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  bg?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("sticker-edge flex items-center justify-center rounded-2xl", className)}
      style={{ width: size, height: size, color, "--sticker-bg": bg } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/** Speech-bubble style label, white on black or black on white */
export function Label({
  children,
  inverted = false,
  className,
}: {
  children: React.ReactNode;
  inverted?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticker-edge sticker-edge-thin whitespace-nowrap rounded-full px-3.5 py-1.5 font-mono text-sm font-bold",
        inverted ? "text-black" : "text-white",
        className
      )}
      style={{ "--sticker-bg": inverted ? "#fff" : "#000" } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/** Big emoji with a white outline */
export function Emoji({ children, size = 56 }: { children: string; size?: number }) {
  return (
    <div className="sticker-outline leading-none" style={{ fontSize: size }} aria-hidden="true">
      {children}
    </div>
  );
}

/** A photo in a white polaroid frame with a handwritten-ish caption */
export function Polaroid({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <div className="sticker-edge w-[72px] rounded-lg p-1 pb-1.5 md:w-[150px] md:p-2 md:pb-3" style={{ "--sticker-bg": "#fff" } as React.CSSProperties}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-black">
        <Image src={src} alt={alt} fill sizes="150px" className="object-cover" draggable={false} />
      </div>
      {caption && (
        <p className="mt-1.5 text-center font-mono text-[9px] font-bold text-black md:mt-2 md:text-[11px]">{caption}</p>
      )}
    </div>
  );
}

/** A row of keyboard keys on a cream sticker, for showing a key sequence */
export function Keycaps({ keys }: { keys: string[] }) {
  return (
    <div
      className="sticker-edge sticker-edge-thin flex items-center gap-1 rounded-xl px-2 py-1.5"
      style={{ "--sticker-bg": "#f2efe8" } as React.CSSProperties}
    >
      {keys.map((k, i) => (
        <span
          key={i}
          className="flex h-6 w-6 items-center justify-center rounded-[5px] border border-black/25 bg-white font-sans text-[12px] font-bold leading-none text-black shadow-[0_2px_0_rgba(0,0,0,0.3)]"
        >
          {k}
        </span>
      ))}
    </div>
  );
}

/** Mini player: album art, title, artist. */
export function TrackChip({
  title,
  artist,
  art,
  icon,
  className,
}: {
  title: string;
  artist: string;
  art: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("sticker-edge flex w-[210px] items-center gap-2.5 rounded-2xl p-2 pr-3 text-white", className)}
      style={{ "--sticker-bg": "#000" } as React.CSSProperties}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={art} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-lg object-cover" draggable={false} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-[10px] font-bold uppercase tracking-wider text-white/50">last played</p>
        <p className="truncate font-mono text-sm font-bold leading-tight">{title}</p>
        <p className="truncate font-mono text-xs text-white/60">{artist}</p>
      </div>
      {icon && <span className="shrink-0 text-[#1db954]">{icon}</span>}
    </div>
  );
}
