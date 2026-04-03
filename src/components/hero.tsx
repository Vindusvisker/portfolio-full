"use client";

import Image from "next/image";
import { SocialLinks } from "./social-links";
import { Boxes } from "./ui/background-boxes";
import { ScrollRevealText } from "./scroll-reveal-text";

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
      <section className="-mt-16 mx-auto max-w-3xl px-6 py-24">
        <ScrollRevealText>
          {"I build scalable web products that solve real problems, from SaaS platforms to AI integrated tools that actually ship to production.\nCurrently a Junior Developer at [Supercompany](https://supercompany.no), where I'm building [trale.ai](https://trale.ai) using Next.js, TypeScript, and Supabase. Bachelor's degree in Data Science from [Noroff](https://noroff.no).\nWhen I'm not coding, I'm probably exercising, watching movies, or teaching AI agents to do my job only to spend even more time reviewing their work.\nCheck out my [projects](/projects) or grab my [CV](/resume.pdf)."}
        </ScrollRevealText>
      </section>

    </>
  );
}
