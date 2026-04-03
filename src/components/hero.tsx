"use client";

import Image from "next/image";
import { SocialLinks } from "./social-links";
import { Boxes } from "./ui/background-boxes";
import { ScrollRevealText } from "./scroll-reveal-text";
import { BlurFade } from "./ui/blur-fade";

export function Hero() {
  return (
    <>
      <div className="relative -mt-32 h-[60dvh] overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-72 bg-gradient-to-t from-background to-transparent" />
        <Boxes className="opacity-20" />
        <section className="pointer-events-none relative z-10 mx-auto flex h-full max-w-3xl flex-col items-start justify-center gap-10 px-6 pb-8 pt-32 sm:flex-row sm:items-center sm:justify-between">
          <div className="pointer-events-auto flex-1">
            <BlurFade delay={0.1} inView>
              <p className="text-sm text-muted-foreground">Hi! I&apos;m</p>
            </BlurFade>
            <BlurFade delay={0.2} inView>
              <h1 className="mt-2 text-4xl font-extrabold uppercase tracking-tight md:text-5xl">
                <span className="text-primary">
                  Marcus Ruud
                </span>
              </h1>
            </BlurFade>
            <BlurFade delay={0.3} inView>
              <div className="mt-6">
                <p className="mb-2 text-xs text-muted-foreground">
                  Psst. You can reach me on
                </p>
                <SocialLinks />
              </div>
            </BlurFade>
          </div>
          <BlurFade delay={0.25} inView className="pointer-events-auto relative">
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
          </BlurFade>
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
