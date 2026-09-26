"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface BubbleState {
  openId: string | null;
  toggle: (id: string) => void;
  close: () => void;
}

const BubbleContext = createContext<BubbleState>({
  openId: null,
  toggle: () => {},
  close: () => {},
});

export function useBubbles() {
  return useContext(BubbleContext);
}

/**
 * Tracks which sticker's speech bubble is open. Only one at a time, and a
 * press anywhere outside a sticker (or Escape) closes it.
 */
export function BubbleProvider({ children }: { children: React.ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!openId) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest("[data-bubble-root]")) setOpenId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    // Capture phase, so stickers stopping propagation can't hide the press.
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [openId]);

  return (
    <BubbleContext.Provider
      value={{
        openId,
        toggle: (id) => setOpenId((cur) => (cur === id ? null : id)),
        close: () => setOpenId(null),
      }}
    >
      {children}
    </BubbleContext.Provider>
  );
}
