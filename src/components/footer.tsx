"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  // The home page is a single screen; nothing should sit below the board.
  if (pathname === "/") return null;
  return (
    <footer className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8 font-mono text-xs text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} Marcus Ruud</p>
      {/* The projects page has its own back-to-top in the dock. */}
      {pathname !== "/projects" && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="cursor-pointer transition-colors hover:text-foreground"
        >
          Back to top ↑
        </button>
      )}
    </footer>
  );
}
