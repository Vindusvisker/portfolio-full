"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { FileText } from "lucide-react";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Thin accent strip across the top */}
      <div className="h-3 w-full bg-background" />

      {/* Logo blob + nav + socials blob */}
      <nav aria-label="Main navigation" className="relative flex items-start justify-between">
        {/* Left: Logo blob + pill */}
        <div className="flex items-start">
          {/* Logo with curved background blob */}
          <div className="relative z-10 flex items-center rounded-br-[2.5rem] bg-background px-6 py-4 pr-10">
            <Link
              href="/"
              className="flex min-h-[44px] items-center text-sm font-bold tracking-tight transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              mruud.com
            </Link>
            {/* Concave curve connecting blob to top strip */}
            <div className="navbar-concave-curve" />
            {/* Concave curve connecting blob to left strip */}
            <div className="navbar-concave-curve-bottom" />
          </div>

          {/* Desktop nav - frosted pill */}
          <div className="mt-2 ml-2 hidden items-center rounded-2xl border border-border/50 bg-white/60 px-2 py-1 backdrop-blur-xl md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex min-h-[44px] items-center rounded-full px-5 text-sm transition-colors duration-150 cursor-pointer ${
                  pathname === link.href
                    ? "text-black font-medium"
                    : "text-black hover:text-black/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </div>

        {/* Right: CV blob (desktop) */}
        <div className="relative z-10 hidden items-center rounded-bl-[2.5rem] bg-background px-6 py-4 pl-10 md:flex">
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            aria-label="Download CV"
          >
            <FileText size={20} />
            <span>CV</span>
          </a>
          {/* Concave curve connecting blob to top strip */}
          <div className="navbar-concave-curve-right" />
          {/* Concave curve connecting blob to right strip */}
          <div className="navbar-concave-curve-bottom-right" />
        </div>

        {/* Mobile toggle */}
        <div className="mt-2 flex items-center gap-2 px-6 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border/50 bg-background/60 backdrop-blur-xl transition-colors hover:bg-background cursor-pointer active:scale-[0.98]"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mx-6 mt-2 rounded-2xl border border-border/50 bg-background/60 px-6 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex min-h-[44px] items-center text-sm transition-colors cursor-pointer ${
                  pathname === link.href
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              <FileText size={18} />
              <span>CV</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
