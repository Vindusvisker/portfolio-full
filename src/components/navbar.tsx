"use client";

import Link from "next/link";
import { TransitionLink } from "./route-transition";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const links = [
  { href: "/stack", label: "Stack" },
  { href: "/resume.pdf", label: "CV", external: true },
];

/** Life (the sticker board) or Work (the projects page), as a sticker-style toggle. */
function ModeSwitch({ pathname, className }: { pathname: string; className?: string }) {
  const mode = pathname === "/" ? "life" : pathname.startsWith("/projects") ? "work" : null;
  const half =
    "flex min-h-[28px] items-center rounded-full px-2.5 transition-colors md:min-h-[36px] md:px-4";
  return (
    <div
      role="group"
      aria-label="Life or work"
      className={cn(
        "sticker-edge sticker-edge-thin pointer-events-auto flex items-center rounded-full p-0.5 font-mono text-xs font-bold md:text-sm",
        className
      )}
      style={{ "--sticker-bg": "#000" } as React.CSSProperties}
    >
      <TransitionLink
        href="/"
        aria-current={mode === "life" ? "page" : undefined}
        className={cn(half, mode === "life" ? "bg-white text-black" : "text-white/70 hover:text-white")}
      >
        Life
      </TransitionLink>
      <TransitionLink
        href="/projects"
        aria-current={mode === "work" ? "page" : undefined}
        className={cn(half, mode === "work" ? "bg-white text-black" : "text-white/70 hover:text-white")}
      >
        Work
      </TransitionLink>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();

  // Every page puts its headline top-left (see SectionTitle), so the brand lives top-right.
  const brand = (
    <TransitionLink
      href="/"
      className="pointer-events-auto flex min-h-[44px] items-center gap-2 text-foreground transition-opacity hover:opacity-70"
    >
      <Logo size={22} />
      <span className="hidden font-display text-xl font-semibold uppercase leading-none tracking-wide sm:inline">Marcus Ruud</span>
    </TransitionLink>
  );

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <nav
        aria-label="Main navigation"
        className="relative flex items-center justify-end gap-4 px-4 py-3 font-mono text-sm md:gap-8 md:px-8 md:py-4"
      >

        {/* Big switch, centered on large screens */}
        <ModeSwitch pathname={pathname} className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex" />

        <ul className="pointer-events-auto flex items-center gap-4 md:gap-6">
          {/* Compact switch inline with the links below lg */}
          <li className="lg:hidden">
            <ModeSwitch pathname={pathname} />
          </li>
          {links.map((link) =>
            link.external ? (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] items-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ) : (
              <li key={link.href}>
                <TransitionLink
                  href={link.href}
                  className={`flex min-h-[44px] items-center transition-colors hover:text-foreground ${
                    pathname === link.href
                      ? "text-foreground underline underline-offset-4"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </TransitionLink>
              </li>
            )
          )}
        </ul>
        {brand}
      </nav>
    </header>
  );
}
