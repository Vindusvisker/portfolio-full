"use client";

import Image from "next/image";
import { SocialLinks } from "./social-links";
import { Boxes } from "./ui/background-boxes";

export function Hero() {
  return (
    <>
      <div className="relative -mt-32 h-[60dvh] overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-72 bg-gradient-to-t from-background to-transparent" />
        <Boxes className="opacity-20" />
        <section className="pointer-events-none relative z-10 mx-auto flex h-full max-w-3xl flex-col items-start justify-center gap-10 px-6 pb-8 pt-32 sm:flex-row sm:items-center sm:justify-between">
          <div className="pointer-events-auto flex-1">
            <p className="slide-enter text-sm text-muted-foreground">Hi! I&apos;m</p>
            <h1 className="slide-enter slide-enter-delay-1 mt-2 text-4xl font-extrabold uppercase tracking-tight md:text-5xl">
              <span className="text-primary">
                Marcus Ruud
              </span>
            </h1>
            <div className="slide-enter slide-enter-delay-2 mt-6">
              <p className="mb-2 text-xs text-muted-foreground">
                Psst. You can reach me on
              </p>
              <SocialLinks />
            </div>
          </div>
          <div className="slide-enter slide-enter-delay-2 pointer-events-auto relative">
            <div className="relative h-48 w-48 overflow-hidden rounded-full border-2 border-border/30 shadow-lg md:h-60 md:w-60">
              <Image
                src="/profile.jpg"
                alt="Marcus Ruud"
                fill
                sizes="(max-width: 640px) 256px, 320px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>
      </div>
      <div className="h-24" />
      <section className="relative z-10 -mt-32 mx-auto max-w-3xl px-6 pb-6">
        <div className="slide-enter slide-enter-delay-3 space-y-4 text-base leading-relaxed text-foreground">
          <p>
            I build scalable web products that solve real problems, from SaaS platforms
            to AI integrated tools that actually ship to production.
          </p>
          <p>
            Currently a Junior Developer at{" "}
            <a href="https://supercompany.no" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-muted-foreground transition-colors">Supercompany</a>,
            where I&apos;m building{" "}
            <a href="https://trale.ai" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-muted-foreground transition-colors">trale.ai</a>
            {" "}using Next.js, TypeScript, and Supabase. Bachelor&apos;s degree in Data Science from{" "}
            <a href="https://noroff.no" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-muted-foreground transition-colors">Noroff</a>.
          </p>
          <p>
            When I&apos;m not coding, I&apos;m probably exercising, watching movies, or
            teaching AI agents to do my job only to spend even more time reviewing their work.
          </p>
          <p>
            Check out my{" "}
            <a href="/projects" className="underline underline-offset-4 hover:text-muted-foreground transition-colors">projects</a>
            {" "}or grab my{" "}
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-muted-foreground transition-colors">CV</a>.
          </p>
        </div>
      </section>
    </>
  );
}
