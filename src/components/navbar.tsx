"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { SocialLinks } from "./social-links";
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
      {/* Top row: logo blob + nav */}
      <nav aria-label="Main navigation" className="relative flex items-end">
        {/* Logo with curved background blob */}
        <div className="relative z-10 flex items-center rounded-br-[2.5rem] bg-accent px-6 py-4 pr-10">
          <Link
            href="/"
            className="flex min-h-[44px] items-center text-sm font-bold tracking-tight transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            mruud.com
          </Link>
        </div>

        {/* Desktop nav - frosted pill */}
        <div className="mb-2 ml-4 hidden items-center rounded-full border border-border/50 bg-background/60 px-2 backdrop-blur-xl md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-h-[44px] items-center rounded-full px-5 text-sm transition-colors duration-150 cursor-pointer ${
                pathname === link.href
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <SocialLinks />
          <ThemeToggle />
        </div>

        {/* Mobile toggle */}
        <div className="mb-2 flex flex-1 items-center justify-end gap-2 px-6 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border/50 bg-background/60 backdrop-blur-xl transition-colors hover:bg-accent cursor-pointer active:scale-[0.98]"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Thin accent strip that extends full width */}
      <div className="h-3 w-full bg-accent" />

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
            <SocialLinks />
          </div>
        </div>
      )}
    </header>
  );
}
