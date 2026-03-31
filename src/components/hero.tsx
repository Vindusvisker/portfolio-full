"use client";

import Image from "next/image";
import { SocialLinks } from "./social-links";
import { GridScan } from "./GridScan";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const darkTheme = {
  linesColor: "#3d3568",
  scanColor: "#9b8ad4",
};

const lightTheme = {
  linesColor: "#b0a8d0",
  scanColor: "#5b4f91",
};

export function Hero() {
  const { theme } = useTheme();
  const [colors, setColors] = useState(darkTheme);

  useEffect(() => {
    setColors(theme === "light" ? lightTheme : darkTheme);
  }, [theme]);

  return (
    <>
      <section className="relative -mt-20 h-dvh">
        {/* GridScan background — z-10 so it receives mouse events */}
        <div className="absolute inset-0 z-10">
          <GridScan
            sensitivity={0.55}
            lineThickness={1}
            linesColor={colors.linesColor}
            scanColor={colors.scanColor}
            scanOpacity={0.4}
            gridScale={0.1}
            enablePost
            bloomIntensity={0.6}
            chromaticAberration={0.002}
            noiseIntensity={0.01}
          />
        </div>

        <div className="relative z-20 pointer-events-none mx-auto flex h-full max-w-3xl flex-col items-start gap-10 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 pointer-events-auto">
            <p className="slide-enter text-sm text-muted-foreground">Hi! I&apos;m</p>
            <h1 className="slide-enter slide-enter-delay-1 mt-2 text-4xl font-extrabold uppercase tracking-tight md:text-5xl">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
          <div className="slide-enter slide-enter-delay-2 relative pointer-events-auto">
            <div className="relative h-64 w-64 overflow-hidden rounded-2xl border border-border/50 md:h-80 md:w-80">
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
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-16">
        <h2 className="slide-enter slide-enter-delay-3 text-lg font-bold">About me</h2>
        <p className="slide-enter slide-enter-delay-4 mt-4 text-sm leading-relaxed text-muted-foreground">
          I&apos;m a strategic and execution-focused developer passionate about building
          scalable SaaS, AI-integrated tools, and efficient digital products. With a strong
          foundation in full-stack development, I specialize in Next.js, TypeScript, and
          Supabase.
        </p>
      </section>
    </>
  );
}
