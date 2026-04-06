"use client";

import { useRef, useMemo } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

interface Token {
  word: string;
  href?: string;
  isSpace?: boolean;
  index: number;
}

function parseTokens(text: string): Token[] {
  const tokens: Token[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let tokenIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index);
    if (before) {
      for (const part of before.split(/(\s+)/)) {
        if (part.length === 0) continue;
        tokens.push({
          word: part,
          isSpace: /^\s+$/.test(part),
          index: tokenIndex++,
        });
      }
    }
    const linkWords = match[1].split(/\s+/);
    linkWords.forEach((w) =>
      tokens.push({ word: w, href: match![2], index: tokenIndex++ })
    );
    lastIndex = regex.lastIndex;
  }

  const remaining = text.slice(lastIndex);
  if (remaining) {
    for (const part of remaining.split(/(\s+)/)) {
      if (part.length === 0) continue;
      tokens.push({
        word: part,
        isSpace: /^\s+$/.test(part),
        index: tokenIndex++,
      });
    }
  }

  return tokens;
}

export function ScrollRevealText({ children }: { children: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, {
    amount: 0.3,
    once: false,
  });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const rotation = useTransform(scrollYProgress, [0, 0.5, 1], [2, 0, 0]);

  const paragraphs = useMemo(() => {
    return children.split("\n").map((para) => parseTokens(para.trim()));
  }, [children]);

  const containerVariants = {
    hidden: {
      opacity: 0,
      transition: {
        staggerChildren: 0.02,
        staggerDirection: -1,
      },
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.05,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0.1,
      filter: "blur(4px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        damping: 25,
        stiffness: 100,
        mass: 1,
        duration: 0.6,
      },
    },
  };

  return (
    <motion.div
      ref={containerRef}
      style={{ rotate: rotation }}
      className="transform-gpu"
    >
      <motion.div
        className="space-y-6 text-xl font-bold leading-snug md:text-3xl"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {paragraphs.map((tokens, pi) => (
          <p key={pi}>
            {tokens.map((token) =>
              token.isSpace ? (
                <span key={`s-${token.index}`}>{token.word}</span>
              ) : token.href ? (
                <motion.span
                  key={`w-${token.index}`}
                  className="inline-block"
                  variants={wordVariants}
                >
                  <a
                    href={token.href}
                    target={token.href.startsWith("/") ? undefined : "_blank"}
                    rel={
                      token.href.startsWith("/")
                        ? undefined
                        : "noopener noreferrer"
                    }
                    className={cn(
                      "underline underline-offset-4 transition-colors duration-150 cursor-pointer",
                      token.href.startsWith("/")
                        ? "text-green-400/80 hover:text-green-400"
                        : "text-blue-400/80 hover:text-blue-400"
                    )}
                  >
                    {token.word}
                  </a>
                </motion.span>
              ) : (
                <motion.span
                  key={`w-${token.index}`}
                  className="inline-block"
                  variants={wordVariants}
                >
                  {token.word}
                </motion.span>
              )
            )}
          </p>
        ))}
      </motion.div>
    </motion.div>
  );
}
