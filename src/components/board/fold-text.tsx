"use client";

import { gsap } from "gsap";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Split every word in a React tree into a foldable panel. Elements are kept
 * (links, spans), only their text is split, so markup inside a card survives.
 * Components that take content through props other than `children` should
 * call this on that content themselves.
 */
export function foldify(node: ReactNode, keyPrefix = "f"): ReactNode {
  return Children.map(node, (child, i) => {
    if (typeof child === "string" || typeof child === "number") {
      return String(child)
        .split(/(\s+)/)
        .map((part, j) => {
          if (!part) return null;
          if (/^\s+$/.test(part)) return part;
          return (
            <span className="fold-seg" key={`${keyPrefix}-${i}-${j}`}>
              <span className="fold-piece">{part}</span>
            </span>
          );
        });
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children !== undefined) {
      return cloneElement(child, undefined, foldify(child.props.children, `${keyPrefix}-${i}`));
    }
    return child;
  });
}

interface FoldTextProps {
  children: ReactNode;
  className?: string;
  /** Seconds each word takes to unfold */
  duration?: number;
  /** Seconds between words */
  stagger?: number;
  /** Wait until the text scrolls into view before unfolding, once. */
  inView?: boolean;
}

/**
 * Unfolds its text word by word from a top hinge on mount. Based on the
 * React Bits FoldText, adapted to animate arbitrary children.
 */
export function FoldText({ children, className, duration = 0.5, stagger = 0.03, inView = false }: FoldTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const pieces = root.querySelectorAll<HTMLElement>(".fold-piece");
    if (!pieces.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = {
      opacity: 0,
      rotateX: reduceMotion ? 0 : -92,
      transformOrigin: "50% 0%",
      "--fold-crease": reduceMotion ? 0 : 0.55,
      force3D: true,
    };
    const to = {
      opacity: 1,
      rotateX: 0,
      "--fold-crease": 0,
      duration: reduceMotion ? 0.2 : duration,
      stagger: reduceMotion ? 0.01 : stagger,
      ease: "power3.out",
      clearProps: "willChange",
    };

    let tween: gsap.core.Tween | null = null;
    if (!inView) {
      tween = gsap.fromTo(pieces, from, to);
      return () => {
        tween?.kill();
      };
    }

    // Hold the folded state until the text scrolls in, then unfold once.
    gsap.set(pieces, from);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        tween = gsap.fromTo(pieces, from, to);
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(root);
    return () => {
      io.disconnect();
      tween?.kill();
    };
    // Runs once per mount; the card deck remounts this for every card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={className}>
      {foldify(children)}
    </div>
  );
}
