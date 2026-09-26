"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/** The trale.ai mark: three overlapping circles on a rounded square. */
export function TraleMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" fill="none" aria-hidden="true">
      <rect width="38" height="38" rx="8" fill="#000" />
      <ellipse cx="14.29" cy="19" rx="8.29" ry="8" fill="#f5f5f5" />
      <ellipse cx="22.58" cy="19" rx="5.92" ry="5.72" fill="#f5f5f5" />
      <ellipse cx="28.45" cy="19" rx="3.55" ry="3.43" fill="#f5f5f5" />
    </svg>
  );
}

/** Meeting that started a little before the page opened, ticking every second. */
function useMeetingClock(startOffsetSeconds: number) {
  const [elapsed, setElapsed] = useState<number | null>(null);
  useEffect(() => {
    const t0 = Date.now() - startOffsetSeconds * 1000;
    const tick = () => setElapsed(Math.floor((Date.now() - t0) / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startOffsetSeconds]);
  if (elapsed == null) return "--:--";
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * A tiny video call with two participants: Marcus and Trale, the AI notetaker
 * he builds. The product in one picture, the way it looks on trale.ai.
 */
export function MeetingTile() {
  const time = useMeetingClock(14 * 60 + 32);

  return (
    <div
      className="sticker-edge sticker-edge-thin w-[224px] overflow-hidden rounded-xl text-white"
      style={{ "--sticker-bg": "#161616" } as React.CSSProperties}
    >
      <div className="flex items-center justify-between px-2.5 pb-1 pt-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-white/55">
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
          </span>
          Rec
        </span>
        <span className="tabular-nums" suppressHydrationWarning>
          {time}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1 px-1">
        <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-black">
          <Image src="/profile.jpg" alt="" fill sizes="110px" className="object-cover" draggable={false} />
          <span className="absolute bottom-1 left-1 rounded-[3px] bg-[#f6f6f4] px-1 py-px font-sans text-[8px] font-medium leading-tight text-black">
            Marcus
          </span>
        </div>
        <div className="relative flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-md bg-[#0a0a0a]">
          <TraleMark size={22} />
          <span className="font-sans text-[10px] font-semibold leading-none">Trale</span>
          <span className="absolute bottom-1 left-1 rounded-[3px] bg-[#f6f6f4] px-1 py-px font-sans text-[8px] font-medium leading-tight text-black">
            AI Notetaker
          </span>
        </div>
      </div>

      <p className="flex items-center gap-1.5 px-2.5 pb-1.5 pt-1.5 font-mono text-[9px] text-white/55">
        <span aria-hidden="true">✎</span>
        taking notes<span className="dots" aria-hidden="true" />
      </p>
    </div>
  );
}
