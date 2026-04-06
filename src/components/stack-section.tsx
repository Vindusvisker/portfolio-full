"use client";

import { ScrollRevealText } from "./scroll-reveal-text";
import type { IconType } from "react-icons";
import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiAstro,
  SiVite,
  SiReactquery,
  SiSupabase,
  SiPostgresql,
  SiTailwindcss,
  SiVercel,
  SiStripe,
  SiShadcnui,
  SiRadixui,
  SiFramer,
  SiGreensock,
  SiReacthookform,
  SiNodedotjs,
  SiResend,
  SiPayloadcms,
  SiGraphql,
  SiOpenai,
  SiAnthropic,
  SiGooglechrome,
  SiGooglecalendar,
  SiGithub,
  SiDocker,
  SiCloudflare,
  SiGooglecloud,
  SiPosthog,
  SiSentry,
  SiBun,
  SiPython,
  SiJupyter,
  SiPandas,
  SiNumpy,
  SiScikitlearn,
  SiFirebase,
  SiRedis,
  SiMongodb,
  SiPrisma,
  SiJest,
  SiPostman,
  SiGo,
  SiRust,
  SiCplusplus,
  SiKubernetes,
  SiTerraform,
  SiCanva,
  SiZod,
  SiMdx,
} from "react-icons/si";
import { FaAws } from "react-icons/fa";
import {
  BarChart3,
  Bell,
  Command,
  Database,
  Globe,
  KeyRound,
  Mic,
  Moon,
  Film,
  Flame,
  Monitor,
  Plug,
  Satellite,
  Store,
  ScrollText,
  Search,
  TestTube,
  Workflow,
} from "lucide-react";

const ICON_MAP: Record<string, IconType> = {
  "Next.js": SiNextdotjs,
  "React": SiReact,
  "TypeScript": SiTypescript,
  "Astro": SiAstro,
  "Vite": SiVite,
  "TanStack": SiReactquery,
  "Supabase": SiSupabase,
  "PostgreSQL": SiPostgresql,
  "Tailwind CSS": SiTailwindcss,
  "Vercel": SiVercel,
  "Stripe": SiStripe,
  "Shadcn UI": SiShadcnui,
  "Radix UI": SiRadixui,
  "Framer Motion": SiFramer,
  "GSAP": SiGreensock,
  "React Hook Form": SiReacthookform,
  "Node.js": SiNodedotjs,
  "Resend": SiResend,
  "Payload CMS": SiPayloadcms,
  "GraphQL": SiGraphql,
  "OpenAI API": SiOpenai,
  "Anthropic API": SiAnthropic,
  "Vercel AI SDK": SiVercel,
  "Chrome Extension APIs": SiGooglechrome,
  "Calendar APIs": SiGooglecalendar,
  "GitHub": SiGithub,
  "Docker": SiDocker,
  "Cloudflare": SiCloudflare,
  "AWS": FaAws,
  "GCP": SiGooglecloud,
  "PostHog": SiPosthog,
  "Sentry": SiSentry,
  "Bun": SiBun,
  "Python": SiPython,
  "Jupyter": SiJupyter,
  "pandas": SiPandas,
  "NumPy": SiNumpy,
  "scikit-learn": SiScikitlearn,
  "Firebase": SiFirebase,
  "Redis": SiRedis,
  "MongoDB": SiMongodb,
  "Prisma": SiPrisma,
  "Jest": SiJest,
  "Postman": SiPostman,
  "Go": SiGo,
  "Rust": SiRust,
  "C++": SiCplusplus,
  "Kubernetes": SiKubernetes,
  "Terraform": SiTerraform,
  "React Email": SiReact,
  "SQL": SiPostgresql,
  "Recharts": BarChart3,
  "cmdk": Command,
  "sonner": Bell,
  "Lenis": ScrollText,
  "Next Themes": Moon,
  "Neon": Database,
  "pgvector": Database,
  "Gladia API": Mic,
  "Exa API": Search,
  "OAuth": KeyRound,
  "WebSockets": Plug,
  "Playwright": TestTube,
  "Firecrawl": Flame,
  "Bright Data": Satellite,
  "Inngest": Workflow,
  "REST APIs": Globe,
  "Matplotlib": BarChart3,
  "Seaborn": BarChart3,
  "Zustand": Store,
  "Canva": SiCanva,
  "Premiere Pro": Film,
  "iMovie": Film,
  "Screen Studio": Monitor,
  "Zod": SiZod,
  "MDX": SiMdx,
};

interface StackItem {
  name: string;
  note: string;
}

export function StackSection({
  category,
  description,
  items,
}: {
  category: string;
  description: string;
  items: StackItem[];
}) {
  return (
    <div>
      <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {category}
      </h2>
      <div className="mt-4">
        <ScrollRevealText>{description}</ScrollRevealText>
      </div>
      <div className="mt-6 space-y-2">
        {items.map((item) => {
          const Icon = ICON_MAP[item.name];
          return (
            <div
              key={item.name}
              className="flex items-center gap-4 rounded-lg px-3 py-2 transition-colors hover:bg-accent"
            >
              {Icon ? (
                <Icon className="shrink-0 w-4 h-4 text-muted-foreground" />
              ) : (
                <span className="shrink-0 w-4 h-4" />
              )}
              <span className="shrink-0 text-sm font-medium">{item.name}</span>
              <span className="hidden h-px flex-1 bg-border/50 sm:block" />
              <span className="text-xs text-muted-foreground">{item.note}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
