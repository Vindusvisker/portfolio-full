"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/stack", label: "Stack" },
  { href: "/resume.pdf", label: "CV", external: true },
];

export function Navbar() {
  const pathname = usePathname();
  // The projects page puts its own headline top-left, so the brand moves right.
  const brandRight = pathname === "/projects";

  const brand = (
    <Link
      href="/"
      className="pointer-events-auto flex min-h-[44px] items-center gap-2 text-foreground transition-opacity hover:opacity-70"
    >
      <Logo size={22} />
      <span className={`font-bold ${brandRight ? "hidden sm:inline" : ""}`}>Marcus Ruud</span>
    </Link>
  );

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <nav
        aria-label="Main navigation"
        className={`flex items-center px-5 py-4 font-mono text-sm md:px-8 ${
          brandRight ? "justify-end gap-6 md:gap-8" : "justify-between"
        }`}
      >
        {!brandRight && brand}
        <ul className="pointer-events-auto flex items-center gap-4 md:gap-6">
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
                <Link
                  href={link.href}
                  className={`flex min-h-[44px] items-center transition-colors hover:text-foreground ${
                    pathname === link.href
                      ? "text-foreground underline underline-offset-4"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            )
          )}
        </ul>
        {brandRight && brand}
      </nav>
    </header>
  );
}
