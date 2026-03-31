"use client";

import { ArrowUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative">
      <div className="flex justify-between">
        <div className="footer-concave-left h-[2.5rem] w-[2.5rem]" />
        <div className="footer-concave-right h-[2.5rem] w-[2.5rem]" />
      </div>
      <div className="relative flex items-center bg-background px-6 py-3">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Marcus Ruud
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
        >
          Back to top <ArrowUp size={14} />
        </button>
      </div>
    </footer>
  );
}
