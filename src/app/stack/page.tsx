import { Boxes } from "@/components/ui/background-boxes";
import { BlurFade } from "@/components/ui/blur-fade";
import { StackSection } from "@/components/stack-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stack - Marcus Ruud",
  description: "The tools, frameworks, and technologies I use to build products.",
};

const stack = [
  {
    category: "Core",
    description: "This is what I reach for most of the time. Next.js is the go-to, but I reach for Astro or Vite when it makes more sense. TypeScript always. PostgreSQL is the backbone, Supabase wraps it. Tailwind handles the styling. Vercel ships it.",
    items: [
      { name: "Next.js", note: "App Router, full-stack framework" },
      { name: "React", note: "UI layer everywhere" },
      { name: "TypeScript", note: "Primary language, on everything" },
      { name: "Astro", note: "Content sites and static builds" },
      { name: "Vite", note: "Fast dev server and bundler" },
      { name: "TanStack", note: "Query, Router, Table" },
      { name: "Supabase", note: "Auth, DB, realtime, storage, embeddings" },
      { name: "PostgreSQL", note: "Underlying database" },
      { name: "Tailwind CSS", note: "Styling system" },
      { name: "Vercel", note: "Hosting, edge functions, deployments" },
      { name: "Stripe", note: "Payments and subscriptions" },
    ],
  },
  {
    category: "Frontend Ecosystem",
    description: "Shadcn and Radix for components. Framer Motion and GSAP for animations. Recharts for data viz. I care a lot about how things feel, not just how they work.",
    items: [
      { name: "Shadcn UI", note: "Component system, Radix-based" },
      { name: "Radix UI", note: "Accessible UI primitives" },
      { name: "Framer Motion", note: "Animations and transitions" },
      { name: "GSAP", note: "Advanced scroll and timeline animations" },
      { name: "Recharts", note: "Charts and data visualization" },
      { name: "Next Themes", note: "Dark/light mode" },
      { name: "MDX", note: "Content and documentation" },
      { name: "Zustand", note: "State management" },
    ],
  },
  {
    category: "Backend & APIs",
    description: "PostgreSQL is the backbone, always has been. Supabase wraps it with auth, realtime, and storage. Neon for serverless Postgres when I need a separate DB. Resend and React Email for transactional emails. Stripe webhooks for billing flows.",
    items: [
      { name: "Node.js", note: "Runtime + API routes" },
      { name: "Neon", note: "Serverless Postgres" },
      { name: "pgvector", note: "Embeddings and vector search" },
      { name: "Resend", note: "Email sending" },
      { name: "React Email", note: "Email templates" },
      { name: "Payload CMS", note: "CMS and admin panels" },
      { name: "Zod", note: "Schema validation" },
      { name: "Inngest", note: "Background jobs and scraping pipelines" },
      { name: "REST APIs", note: "General integrations" },
      { name: "GraphQL", note: "Exposure, not core stack" },
      { name: "WebSockets", note: "Via Supabase realtime" },
    ],
  },
  {
    category: "AI & Integrations",
    description: "I integrate AI into products that actually ship. OpenAI and Claude for generation and reasoning. Gladia for speech-to-text at Trale. Exa for search and competitor discovery. Playwright for scraping. This is where my data science background meets real products.",
    items: [
      { name: "OpenAI API", note: "GPT-4, embeddings, structured output" },
      { name: "Anthropic API", note: "Claude for complex reasoning" },
      { name: "Vercel AI SDK", note: "Streaming and tool use" },
      { name: "Gladia API", note: "Speech-to-text at Trale" },
      { name: "Exa API", note: "Search and competitor discovery" },
      { name: "Playwright", note: "Scraping and page extraction" },
      { name: "Firecrawl", note: "Web scraping API" },
      { name: "Bright Data", note: "Proxy and scraping infrastructure" },
      { name: "Chrome Extension APIs", note: "Dokio + Trale extensions" },
      { name: "OAuth", note: "Auth integrations" },
      { name: "Calendar APIs", note: "Google Calendar, meeting context" },
    ],
  },
  {
    category: "DevOps & Tooling",
    description: "Ship fast, break nothing. Vercel for deploys, GitHub Actions for CI. Bun for speed and monorepos. Sentry catches errors, PostHog tracks product usage. Cloudflare R2 for object storage.",
    items: [
      { name: "GitHub", note: "Version control, CI/CD, Actions" },
      { name: "Docker", note: "Containers via Orbstack" },
      { name: "Cloudflare", note: "DNS, CDN, R2 storage" },
      { name: "AWS", note: "S3, Lambda, EC2" },
      { name: "GCP", note: "Cloud Run, BigQuery" },
      { name: "PostHog", note: "Product analytics and feature flags" },
      { name: "Sentry", note: "Error tracking" },
      { name: "Bun", note: "Fast runtime and tooling" },
    ],
  },
  {
    category: "Data Science",
    description: "Bachelor's in Data Science from Noroff. Python, Jupyter, pandas, scikit-learn, the full academic stack. I love applying statistical thinking to the products I build. Signal scoring in Relate, retention analysis at Trale, not just academic exercises.",
    items: [
      { name: "Python", note: "Primary DS language" },
      { name: "Jupyter", note: "Analysis and experiments" },
      { name: "pandas", note: "Data manipulation" },
      { name: "NumPy", note: "Numerical computing" },
      { name: "scikit-learn", note: "Classical ML models" },
      { name: "Matplotlib", note: "Plotting and visualization" },
      { name: "Seaborn", note: "Statistical visualization" },
      { name: "SQL", note: "Querying datasets" },
    ],
  },
  {
    category: "Design & Media",
    description: "I make my own assets, recordings, and videos. Premiere Pro for video editing, Screen Studio for polished screen recordings, Canva for quick design work.",
    items: [
      { name: "Premiere Pro", note: "Video editing" },
      { name: "iMovie", note: "Quick video editing" },
      { name: "Screen Studio", note: "Screen recordings" },
      { name: "Canva", note: "Design and assets" },
    ],
  },
  {
    category: "Learning",
    description: "Technologies I'm exploring and want to get deeper into. The goal is always to build something real with them.",
    items: [
      { name: "Go", note: "Fast, concurrent services" },
      { name: "Rust", note: "Systems programming" },
      { name: "C++", note: "Performance-critical work" },
      { name: "Kubernetes", note: "Container orchestration" },
      { name: "Terraform", note: "Infrastructure as code" },
    ],
  },
];

export default function StackPage() {
  return (
    <>
      <div className="relative -mt-32 h-[40dvh] overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-72 bg-gradient-to-t from-background to-transparent" />
        <Boxes className="opacity-20" />
        <section className="pointer-events-none relative z-10 mx-auto flex h-full max-w-3xl flex-col justify-end px-6 pb-8 pt-32">
          <div className="pointer-events-auto">
            <BlurFade delay={0.05} inView>
              <h1 className="text-2xl font-extrabold tracking-tight">Stack</h1>
            </BlurFade>
            <BlurFade delay={0.1} inView>
              <p className="mt-2 text-sm text-muted-foreground">
                The tools and technologies I use to build products.
              </p>
            </BlurFade>
          </div>
        </section>
      </div>
      <section className="mx-auto max-w-3xl px-6 py-8">
        <div className="space-y-16">
          {stack.map((section, i) => (
            <BlurFade key={section.category} delay={0.05 + i * 0.03} inView>
              <StackSection
                category={section.category}
                description={section.description}
                items={section.items}
              />
            </BlurFade>
          ))}
        </div>
      </section>
    </>
  );
}
