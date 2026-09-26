"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface Theme {
  bg: string;
  fg: string;
  /** Rubber-stamped on the sheet once it lands; empty for pages that don't want one. */
  label: string;
  /** Seconds the sheet holds before lifting: long enough to read a stamp, short without one. */
  hold: number;
  /** What the sheet is made of, so the cover looks like the page it reveals. */
  material: "blueprint" | "cream" | "dark";
  /** Which side of the Life | Work switch this page sits on. */
  side: "left" | "right";
}

/**
 * Each destination slides its own sheet over the page from its side of the
 * switch, gets stamped with its name, and the page underneath swaps while
 * it's covered. The sheet matches the destination's real background, so when
 * it lifts only the content appears to change.
 */
const THEMES: Record<string, Theme> = {
  "/": { bg: "#1a3f8a", fg: "#f2efe8", label: "Life", hold: 0.55, material: "blueprint", side: "left" },
  // Flat cream and no stamp: the Work hero is a bare sheet, and the sphere
  // growing in as the sheet lifts is the arrival.
  "/projects": { bg: "#f2ede4", fg: "#1a1713", label: "", hold: 0.12, material: "cream", side: "right" },
  // Black and no stamp: on lift, the star field is streaking past and the
  // globe flies in, so the arrival is the page itself (see starfield.tsx).
  "/stack": { bg: "#050505", fg: "#f2efe8", label: "", hold: 0.12, material: "dark", side: "right" },
};
const FALLBACK: Theme = { bg: "#050505", fg: "#f2efe8", label: "", hold: 0.12, material: "dark", side: "right" };

interface Transition {
  href: string;
  theme: Theme;
  /** Where the sheet enters from */
  from: "left" | "right";
  phase: "cover" | "reveal";
}

const COVER_EASE = [0.76, 0, 0.24, 1] as const;
/** Fired on window the moment the sheet starts lifting off the new page. */
export const ROUTE_REVEAL_EVENT = "route:reveal";
/** Set on <html> while a sheet covers the page, so heroes can hold their entrance. */
const COVER_ATTR = "data-route-cover";

let revealedAt = -Infinity;
/** When the last sheet started lifting (performance.now()), or -Infinity. */
export function routeRevealedAt() {
  return revealedAt;
}
/** True while a sheet is covering the page. */
export function routeCovered() {
  return typeof document !== "undefined" && document.documentElement.hasAttribute(COVER_ATTR);
}
/** Seconds the sheet slides in, when the stamp lands, and the lift. */
const SLIDE = 0.85;
const STAMP_AT = 0.7;
const LIFT = 0.5;

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
    if (p && p.covered && p.arrived) {
      setT((cur) => (cur ? { ...cur, phase: "reveal" } : cur));
      document.documentElement.removeAttribute(COVER_ATTR);
      revealedAt = performance.now();
      window.dispatchEvent(new CustomEvent(ROUTE_REVEAL_EVENT));
    }
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
      void origin;
      if (href === pathname || pending.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }
      const theme = THEMES[href] ?? FALLBACK;
      // Going to the page on the right, the sheet comes in from the right; and vice versa.
      const from = theme.side;
      pending.current = { href, covered: false, arrived: false };
      document.documentElement.setAttribute(COVER_ATTR, "");
      setT({ href, theme, from, phase: "cover" });
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
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
          <motion.div
            className="absolute inset-0 flex items-center justify-center overflow-hidden will-change-transform"
            style={{
              background: t.theme.bg,
              boxShadow: "0 0 0 1px rgba(0,0,0,0.25), 0 0 120px rgba(0,0,0,0.6)",
            }}
            initial={{ x: t.from === "left" ? "-102%" : "102%", opacity: 1 }}
            animate={t.phase === "cover" ? { x: "0%", opacity: 1 } : { x: "0%", opacity: 0 }}
            transition={
              t.phase === "cover"
                ? { x: { duration: SLIDE, ease: COVER_EASE } }
                : { opacity: { duration: LIFT, ease: "easeOut" } }
            }
            onAnimationComplete={() => {
              if (t.phase === "cover") {
                // Let the stamp sit on the sheet before the page swaps underneath.
                window.setTimeout(() => {
                  if (pending.current) pending.current.covered = true;
                  router.push(t.href);
                  reveal();
                }, t.theme.hold * 1000);
              } else {
                pending.current = null;
                setT(null);
              }
            }}
          >
            {/* The sheet's material, the same layers the real page uses */}
            {t.theme.material === "blueprint" && (
              <>
                <div className="board-glow absolute inset-0" />
                <div className="board-grid absolute inset-0" />
              </>
            )}

            {/* Stamped on once the sheet has landed */}
            {t.theme.label && (
              <motion.span
                className="stamp relative select-none whitespace-nowrap rounded-[0.12em] border-[0.045em] px-[0.18em] pb-[0.02em] pt-[0.06em] font-display text-[26vw] font-bold uppercase leading-none tracking-tight md:text-[16vw]"
                style={{ color: t.theme.fg, borderColor: t.theme.fg, rotate: -6 }}
                initial={{ opacity: 0, scale: 1.5 }}
                animate={t.phase === "cover" ? { opacity: 0.9, scale: 1 } : { opacity: 0, scale: 1 }}
                transition={
                  t.phase === "cover"
                    ? { duration: 0.26, ease: [0.1, 0.9, 0.2, 1], delay: STAMP_AT }
                    : { duration: 0.3, ease: "easeOut" }
                }
              >
                {t.theme.label}
              </motion.span>
            )}
          </motion.div>
        </div>
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
