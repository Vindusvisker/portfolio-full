import Image from "next/image";
import { SocialLinks } from "./social-links";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-3xl gap-10 px-6 py-16 md:grid-cols-[1fr,auto] md:items-center md:py-24">
      <div>
        <p className="slide-enter text-sm text-muted-foreground">Hi! I&apos;m</p>
        <h1 className="slide-enter slide-enter-delay-1 mt-2 text-4xl font-extrabold uppercase tracking-tight md:text-5xl">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Marcus Ruud
          </span>
        </h1>
        <p className="slide-enter slide-enter-delay-2 mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground">
          I&apos;m a strategic and execution-focused developer passionate about building
          scalable SaaS, AI-integrated tools, and efficient digital products. With a strong
          foundation in full-stack development, I specialize in Next.js, TypeScript, and
          Supabase.
        </p>
        <div className="slide-enter slide-enter-delay-3 mt-6">
          <p className="mb-2 text-xs text-muted-foreground">
            Psst. You can reach me on
          </p>
          <SocialLinks />
        </div>
      </div>
      <div className="slide-enter slide-enter-delay-2 relative">
        <div className="relative h-56 w-56 overflow-hidden rounded-2xl border border-border/50 md:h-64 md:w-64">
          <Image
            src="/profile.jpg"
            alt="Marcus Ruud"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
