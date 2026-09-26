"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface Theme {
  bg: string;
  fg: string;
  label: string;
}

/** Each destination spills its own background over the page, with a title card. */
const THEMES: Record<string, Theme> = {
  "/": { bg: "#0d2a63", fg: "#f2efe8", label: "LIFE" },
  "/projects": { bg: "#f2ede4", fg: "#1a1713", label: "WORK" },
  "/stack": { bg: "#050505", fg: "#f2efe8", label: "STACK" },
};
const FALLBACK: Theme = { bg: "#050505", fg: "#f2efe8", label: "" };

interface Transition {
  href: string;
  theme: Theme;
  x: number;
  y: number;
  radius: number;
  phase: "cover" | "reveal";
}

const RouteTransitionContext = createContext<{
  go: (href: string, origin?: { x: number; y: number }) => void;
}>({ go: () => {} });

export function useRouteTransition() {
  return useContext(RouteTransitionContext);
}

export function RouteTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [t, setT] = useState<Transition | null>(null);
  const pending = useRef<{ href: string; covered: boolean; arrived: boolean } | null>(null);

  const reveal = useCallback(() => {
    const p = pending.current;
    if (p && p.covered && p.arrived) setT((cur) => (cur ? { ...cur, phase: "reveal" } : cur));
  }, []);

  // The new route has rendered once the pathname matches; only then let go of the cover.
  useEffect(() => {
    const p = pending.current;
    if (p && pathname === p.href) {
      p.arrived = true;
      reveal();
    }
  }, [pathname, reveal]);

  const go = useCallback(
    (href: string, origin?: { x: number; y: number }) => {
      if (href === pathname || pending.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }
      const x = origin?.x ?? window.innerWidth / 2;
      const y = origin?.y ?? window.innerHeight / 2;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 40;
      pending.current = { href, covered: false, arrived: false };
      setT({ href, theme: THEMES[href] ?? FALLBACK, x, y, radius, phase: "cover" });
      // The route swaps in only once the cover is complete, so the spill always
      // lands on the page the visitor was looking at, even when the next one
      // is prefetched and would otherwise appear instantly.
      router.prefetch(href);
      // Never trap the visitor behind the cover if the route errors.
      window.setTimeout(() => {
        if (pending.current?.href === href) {
          pending.current.arrived = true;
          pending.current.covered = true;
          reveal();
        }
      }, 5000);
    },
    [pathname, router, reveal]
  );

  return (
    <RouteTransitionContext.Provider value={{ go }}>
      {children}
      {t && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: t.theme.bg }}
          initial={{ clipPath: `circle(0px at ${t.x}px ${t.y}px)`, opacity: 1 }}
          animate={
            t.phase === "cover"
              ? { clipPath: `circle(${t.radius}px at ${t.x}px ${t.y}px)`, opacity: 1 }
              : { clipPath: `circle(${t.radius}px at ${t.x}px ${t.y}px)`, opacity: 0 }
          }
          transition={
            t.phase === "cover"
              ? { clipPath: { duration: 0.65, ease: [0.76, 0, 0.24, 1] } }
              : { opacity: { duration: 0.4, ease: "easeOut" } }
          }
          onAnimationComplete={() => {
            if (t.phase === "cover") {
              if (pending.current) pending.current.covered = true;
              router.push(t.href);
              reveal();
            } else {
              pending.current = null;
              setT(null);
            }
          }}
        >
          {t.theme.label && (
            <motion.span
              className="select-none font-mono text-[22vw] font-bold leading-none tracking-tighter md:text-[14vw]"
              style={{ color: t.theme.fg }}
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={t.phase === "cover" ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 1.04, y: -8 }}
              transition={{ duration: t.phase === "cover" ? 0.45 : 0.3, ease: [0.2, 0.8, 0.2, 1], delay: t.phase === "cover" ? 0.15 : 0 }}
            >
              {t.theme.label}
            </motion.span>
          )}
        </motion.div>
      )}
    </RouteTransitionContext.Provider>
  );
}

type TransitionLinkProps = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & { children: React.ReactNode };

/** A next/link that runs the spill transition on a plain left click. */
export function TransitionLink({ href, onClick, children, ...rest }: TransitionLinkProps) {
  const { go } = useRouteTransition();
  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (rest.target && rest.target !== "_self") return;
        e.preventDefault();
        go(typeof href === "string" ? href : (href.pathname ?? "/"), { x: e.clientX, y: e.clientY });
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
