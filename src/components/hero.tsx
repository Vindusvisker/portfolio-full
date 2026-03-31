import Image from "next/image";
import { SocialLinks } from "./social-links";

export function Hero() {
  return (
    <>
      <section className="mx-auto flex max-w-3xl flex-col items-start gap-10 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
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
        <div className="slide-enter slide-enter-delay-2 relative">
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
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
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
