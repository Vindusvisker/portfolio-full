"use client";

import { useEffect, useState } from "react";

const pill =
  "inline-flex min-h-[32px] items-center rounded-full bg-secondary px-3.5 font-mono text-xs font-bold text-foreground transition-colors hover:bg-foreground hover:text-background";

/** Bottom-left pills that show up once the opener has scrolled away. */
export function Dock() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-5 left-5 z-30 flex gap-2 transition-all duration-300 md:left-8 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`${pill} cursor-pointer`}
        aria-label="Back to top"
      >
        ↑
      </button>
      <a href="https://github.com/vindusvisker" target="_blank" rel="noopener noreferrer" className={pill}>
        All repos on GitHub ↗
      </a>
    </div>
  );
}
