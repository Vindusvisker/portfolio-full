"use client";

import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FoldText, foldify } from "./fold-text";

const linkClass =
  "underline decoration-2 underline-offset-4 transition-opacity hover:opacity-70";

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
    </a>
  );
}

function Cta({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const cls =
    "inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 active:translate-y-0";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children} <span aria-hidden="true">↗</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children} <span aria-hidden="true">→</span>
    </Link>
  );
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden="true">–</span>
          <span>{foldify(item, `b-${i}`)}</span>
        </li>
      ))}
    </ul>
  );
}

const cards: { title: string; body: React.ReactNode; cta?: React.ReactNode }[] = [
  {
    title: "Hello",
    body: (
      <>
        Yo, I&apos;m Marcus. I build products with code. Platforms, AI tools,
        automation. Anything, as long as it solves the problem.
      </>
    ),
    cta: <Cta href="/projects">See projects</Cta>,
  },
  {
    title: "Now",
    body: (
      <>
        Developer at <Ext href="https://supercompany.no">Supercompany</Ext>,
        building <Ext href="https://trale.ai">trale.ai</Ext>:
        <Bullets
          items={[
            "AI meeting notetaker",
            "prep, notes and follow-up, handled",
            "thousands of users",
          ]}
        />
      </>
    ),
    cta: (
      <Cta href="https://trale.ai" external>
        trale.ai
      </Cta>
    ),
  },
  {
    title: "Studying",
    body: (
      <>
        Data Science at <Ext href="https://noroff.no">Noroff</Ext> on the side.
        I wanted to understand what&apos;s happening under the hood of the AI
        tools I build every day.
      </>
    ),
  },
  {
    title: "Building",
    body: (
      <>
        On the side I build small products and flip them on Flippa. Latest
        one: <Ext href="https://lerret.app">lerret.app</Ext>, a screenshot and
        device mockup editor that runs in the browser.
      </>
    ),
    cta: (
      <Cta href="https://lerret.app" external>
        lerret.app
      </Cta>
    ),
  },
  {
    title: "Before code",
    body: (
      <>
        Before I wrote code for a living:
        <Bullets
          items={[
            "ran Solvify, outbound automation for early-stage startups",
            "four years as a crane signalman",
            "military before all of that",
          ]}
        />
      </>
    ),
  },
  {
    title: "Obsessed with",
    body: (
      <>
        I&apos;m obsessed with:
        <Bullets
          items={[
            "shipping fast",
            "teaching AI agents to do my job",
            "running (sub-4 marathon in April)",
            "movies",
          ]}
        />
      </>
    ),
    cta: (
      <Cta href="https://www.instagram.com/marcusruud_/" external>
        instagram
      </Cta>
    ),
  },
  {
    title: "Said about me",
    body: (
      <>
        &ldquo;His ability to take ownership of tasks and execute them
        independently has been a huge asset.&rdquo;
        <span className="mt-4 block text-base text-white/50">
          Brede Y. S. Kristensen, Trale AI
        </span>
      </>
    ),
  },
  {
    title: "Work together",
    body: (
      <>
        Let&apos;s work together!
        <Bullets items={["Need something built?", "AI in your product?", "Automation?"]} />
      </>
    ),
    cta: (
      <Cta href="https://www.linkedin.com/in/marcus-ruud-25936a260/" external>
        linkedin
      </Cta>
    ),
  },
  {
    title: "PS",
    body: <>PS: I respond to EVERY email 🫶</>,
    cta: (
      <Cta href="mailto:marcruud@gmail.com" external>
        Email me
      </Cta>
    ),
  },
];

const variants = {
  enter: (dir: number) => ({ y: dir * 48, opacity: 0, scale: 0.97 }),
  center: { y: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ y: dir * -48, opacity: 0, scale: 0.97 }),
};

export function CardDeck() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const go = useCallback((delta: number) => {
    setDir(delta);
    setIndex((i) => (i + delta + cards.length) % cards.length);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea")) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") go(1);
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -60) go(1);
    else if (info.offset.y > 60) go(-1);
  };

  const card = cards[index];

  return (
    <div
      className="relative isolate w-[min(92vw,460px)]"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Cards further back in the stack */}
      {[3, 2, 1].map((k) => (
        <div
          key={k}
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl border bg-black"
          style={{
            zIndex: -k,
            borderColor: `rgba(244,241,234,${0.9 - k * 0.2})`,
            boxShadow: "0 0 0 1px rgba(0,0,0,0.9)",
            transform: `translateY(${k * 14}px) scale(${1 - k * 0.035})`,
          }}
        />
      ))}

      <div className="panel-edge relative z-10 flex h-[340px] flex-col overflow-hidden rounded-3xl bg-black font-mono text-white md:h-[400px]">
        <div className="flex items-center justify-end gap-3 px-5 pt-5">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous card"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/40 transition-colors hover:border-white hover:bg-white hover:text-black"
          >
            <ChevronUp size={14} />
          </button>
          <span className="text-sm font-bold tabular-nums" aria-live="polite">
            {index + 1} / {cards.length}
          </span>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next card"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/40 transition-colors hover:border-white hover:bg-white hover:text-black"
          >
            <ChevronDown size={14} />
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={index}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.25}
            onDragEnd={onDragEnd}
            className="flex min-h-0 flex-1 cursor-grab touch-pan-x flex-col px-6 pb-6 pt-3 active:cursor-grabbing md:px-9 md:pb-7 md:pt-4"
          >
            <span className="sr-only">{card.title}</span>
            <FoldText className="text-base leading-relaxed md:text-xl md:leading-relaxed">{card.body}</FoldText>
            {card.cta && <div className="mt-auto pt-5">{card.cta}</div>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
