"use client";

import { TransitionLink } from "@/components/route-transition";
import { FoldText } from "./fold-text";

const ext = "underline decoration-[1.5px] underline-offset-[3px] transition-opacity hover:opacity-60";

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={ext}>
      {children}
    </a>
  );
}

const linkClass =
  "font-display text-lg font-semibold uppercase leading-none tracking-wide underline decoration-2 underline-offset-[5px] transition-opacity hover:opacity-60";

/**
 * One cream sheet taped to the board with the whole intro on it. No paging,
 * no stack: everything is readable at once, the way a note on a wall is.
 */
export function Sheet() {
  return (
    <div className="relative w-[min(92vw,400px)] -rotate-[1.2deg]" onPointerDown={(e) => e.stopPropagation()}>
      <span aria-hidden="true" className="tape absolute -top-3 left-1/2 z-20 h-7 w-28 -translate-x-1/2 rotate-[4deg]" />

      <div className="panel-paper relative rounded-[3px] bg-[#f2ede4] px-5 pb-4 pt-6 text-[#1a1713] md:px-8 md:pb-6 md:pt-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#1a1713]/50">Note 01 · Hello</p>
        <h1 className="mt-1.5 font-display text-[34px] font-bold uppercase leading-[0.95] tracking-tight md:text-[44px]">
          Yo, I&apos;m Marcus.
        </h1>
        <FoldText className="mt-2.5 font-sans text-[14px] leading-relaxed text-[#1a1713]/90 md:mt-3 md:text-base">
          I build products with code. Platforms, AI tools, automation. Anything, as long as it solves the problem.
        </FoldText>

        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 border-t border-[#1a1713]/15 pt-3.5 text-[13px] leading-snug md:mt-5 md:pt-4 md:text-sm">
          <dt className="pt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#1a1713]/50">Now</dt>
          <dd>
            Developer at <Ext href="https://supercompany.no">Supercompany</Ext>, building{" "}
            <Ext href="https://trale.ai">trale.ai</Ext>. An AI meeting notetaker with thousands of users.
          </dd>
          <dt className="pt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#1a1713]/50">Also</dt>
          <dd>
            Data Science at <Ext href="https://noroff.no">Noroff</Ext> on the side. I build small products and flip
            them, latest one <Ext href="https://lerret.app">lerret.app</Ext>.
          </dd>
        </dl>

        <div className="mt-4 border-t border-[#1a1713]/15 pt-3.5 md:mt-5 md:pt-4">
          <p className="font-mono text-[11px] leading-snug text-[#1a1713]/55">Need something built? I answer every email 🫶</p>
          <div className="mt-3 flex items-baseline justify-end gap-5">
            <a href="mailto:marcruud@gmail.com" className={linkClass}>
              Email <span aria-hidden="true">↗</span>
            </a>
            <TransitionLink href="/projects" className={linkClass}>
              Projects <span aria-hidden="true">→</span>
            </TransitionLink>
          </div>
        </div>
      </div>
    </div>
  );
}
