"use client";

import { TransitionLink } from "./route-transition";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

/** The three pages as one sticker-style switch: Life (board), Work (projects), Stack (tools). */
const modes = [
  { key: "life", href: "/", label: "Life", active: (p: string) => p === "/" },
  { key: "work", href: "/projects", label: "Work", active: (p: string) => p.startsWith("/projects") },
  { key: "stack", href: "/stack", label: "Stack", active: (p: string) => p.startsWith("/stack") },
] as const;

interface Look {
  box: string;
  on: string;
  off: string;
  style?: React.CSSProperties;
  /** Sub-state written to data-look so the CSS can morph between two looks on one page. */
  data?: string;
}

/**
 * The switch dresses for the page it is on: a holographic sticker on the
 * board, a glass readout in the stack's night sky, and on the projects page
 * plain words in difference blend, so they read on cream and on the dark
 * plates, that turn into a sticky note once the paper comes back. Styles for everything but the sticker live in globals.css.
 */
const looks: Record<"life" | "stack" | "plain" | "note", Look> = {
  life: {
    box: "sticker-edge sticker-edge-thin text-xs font-bold md:text-sm",
    on: "bg-white text-black",
    off: "text-white/70 hover:text-white",
    style: { "--sticker-bg": "#000" } as React.CSSProperties,
  },
  stack: {
    box: "mode-switch-space text-[11px] font-medium uppercase tracking-[0.14em] md:text-xs",
    on: "mode-switch-on text-[#f2efe8]",
    off: "text-[#f2efe8]/50 hover:text-[#f2efe8]",
  },
  plain: {
    box: "mode-switch-work text-xs font-bold md:text-sm",
    on: "text-white underline underline-offset-4",
    off: "text-white/50 hover:text-white",
    data: "plain",
  },
  note: {
    box: "mode-switch-work text-xs font-bold md:text-sm",
    on: "mode-switch-note-on",
    off: "text-[#1a1713]/60 hover:text-[#1a1713]",
    data: "note",
  },
};

/**
 * Pages can change the switch's look per section by tagging sections with
 * `data-switch-look`; the last one to pass the top third of the viewport
 * wins, the same line the headline uses.
 */
function useSectionLook(pathname: string) {
  const [look, setLook] = useState<string | null>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-switch-look]"));
      if (els.length === 0) {
        setLook(null);
        return;
      }
      const line = window.innerHeight * 0.38;
      let active = els[0];
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) active = el;
      }
      const next = active.dataset.switchLook ?? null;
      setLook((l) => (l === next ? l : next));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    // Sections land a beat after a route change; look again once they are in.
    const late = window.setTimeout(update, 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearTimeout(late);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);
  return look;
}

function ModeSwitch({ pathname, className }: { pathname: string; className?: string }) {
  const variant = modes.find((m) => m.active(pathname))?.key ?? "life";
  const section = useSectionLook(pathname);
  const look = variant === "work" ? looks[section === "note" ? "note" : "plain"] : looks[variant];
  const half =
    "flex min-h-[28px] items-center rounded-full px-2.5 transition-colors md:min-h-[36px] md:px-4";
  return (
    <div
      role="group"
      aria-label="Life, work or stack"
      data-look={look.data}
      className={cn("pointer-events-auto flex items-center rounded-full p-0.5 font-mono", look.box, className)}
      style={look.style}
    >
      {variant === "work" && <span aria-hidden="true" className="mode-switch-tape tape" />}
      {modes.map((m) => {
        const on = m.active(pathname);
        return (
          <TransitionLink
            key={m.href}
            href={m.href}
            aria-current={on ? "page" : undefined}
            className={cn(half, on ? look.on : look.off)}
          >
            {m.label}
          </TransitionLink>
        );
      })}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();

  // Each piece is its own fixed element rather than a child of one fixed bar:
  // the brand group is drawn in difference blend so it reads on ink, cream and
  // the dark plates alike, and blending only reaches the page when nothing
  // positioned sits between the element and the root.
  return (
    <header>
      <nav aria-label="Main navigation" className="font-mono text-sm">
        <ModeSwitch
          pathname={pathname}
          className="fixed left-1/2 top-[34px] z-40 -translate-x-1/2 -translate-y-1/2 md:left-auto md:right-[124px] md:top-[38px] md:translate-x-0 lg:left-1/2 lg:right-auto lg:-translate-x-1/2"
        />

        {/* Every page puts its headline top-left (see SectionTitle), so the brand lives top-right */}
        <div className="pointer-events-auto fixed right-4 top-3 z-40 flex items-center gap-4 text-white mix-blend-difference md:right-8 md:top-4 md:gap-6">
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center text-white/60 transition-colors hover:text-white"
          >
            CV
          </a>
          <TransitionLink
            href="/"
            className="flex min-h-[44px] items-center gap-2 transition-opacity hover:opacity-70"
          >
            <Logo size={22} />
            <span className="hidden font-display text-xl font-semibold uppercase leading-none tracking-wide lg:inline">
              Marcus Ruud
            </span>
          </TransitionLink>
        </div>
      </nav>
    </header>
  );
}
