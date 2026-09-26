import { StackSection } from "@/components/stack-section";
import { StackGlobe } from "@/components/stack/stack-globe";
import { SectionTitle } from "@/components/projects/section-title";
import { TransitionLink } from "@/components/route-transition";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stack - Marcus Ruud",
  description: "The tools Marcus Ruud builds with, and what each one is for.",
};

// Every note is one sentence with an opinion in it, the same voice as the
// sticker bubbles on the board. A tool without an opinion doesn't make the list.
const stack = [
  {
    category: "Core",
    description:
      "What I reach for by default. Next.js, TypeScript always, Postgres underneath with Supabase around it, Tailwind on top, Vercel to ship. Astro when a site is mostly words.",
    items: [
      { name: "Next.js", note: "The default. App Router, one codebase for the whole product." },
      { name: "React", note: "Where most of my hours have gone." },
      { name: "TypeScript", note: "Always on. The types catch what I'd otherwise catch in production." },
      { name: "Astro", note: "For sites that are mostly words." },
      { name: "TanStack", note: "Query for server state, Table when a grid gets serious." },
      { name: "Supabase", note: "Postgres, auth, realtime and storage in one place. My default backend." },
      { name: "PostgreSQL", note: "Has handled everything I've thrown at it so far." },
      { name: "Tailwind CSS", note: "Lets me iterate on feel without leaving the file." },
      { name: "Vercel", note: "Push to main and it's live. This site included." },
      { name: "Stripe", note: "Behind every product I've charged money for." },
    ],
  },
  {
    category: "Frontend",
    description:
      "I care a lot about how things feel, not just whether they work. Shadcn and Radix for the parts nobody should build twice, Framer Motion and GSAP for the parts that move.",
    items: [
      { name: "Shadcn UI", note: "Copy the component in, then make it mine." },
      { name: "Radix UI", note: "Under shadcn. Handles the accessibility I'd get wrong." },
      { name: "Framer Motion", note: "Micro-interactions and page transitions." },
      { name: "GSAP", note: "For the scroll-driven stuff Framer can't do." },
      { name: "Zustand", note: "The only state library I haven't regretted." },
      { name: "Recharts", note: "Charts, when a product grows a dashboard." },
    ],
  },
  {
    category: "Backend",
    description:
      "Postgres is the backbone, always has been. Neon when a project needs its own database, Inngest for anything that has to outlive a request. GraphQL I've met, not married.",
    items: [
      { name: "Node.js", note: "Route handlers and the odd script." },
      { name: "Neon", note: "Serverless Postgres when a project needs its own database." },
      { name: "pgvector", note: "Embeddings live next to the rows they describe." },
      { name: "Zod", note: "Every input gets a schema. Every API too." },
      { name: "Inngest", note: "Background jobs and scraping pipelines that survive a deploy." },
      { name: "Resend", note: "Transactional email, templates written in React Email." },
      { name: "Payload CMS", note: "When a client needs an admin panel and I don't want to build one." },
    ],
  },
  {
    category: "AI",
    description:
      "AI in products that actually ship, not demos. OpenAI and Claude for generation and reasoning, Gladia for speech at trale.ai, Playwright and Exa for finding things. This is where the data science degree earns its keep.",
    items: [
      { name: "OpenAI API", note: "Generation, embeddings, structured output." },
      { name: "Anthropic API", note: "Claude, for the reasoning-heavy parts." },
      { name: "Vercel AI SDK", note: "Streaming and tool use without the boilerplate." },
      { name: "Gladia API", note: "Speech to text at trale.ai. Every meeting goes through it." },
      { name: "Exa API", note: "Search and competitor discovery." },
      { name: "Playwright", note: "Scraping, page extraction, and the screenshots for this site." },
      { name: "Chrome Extension APIs", note: "The trale.ai and Dokio extensions." },
    ],
  },
  {
    category: "Tooling",
    description:
      "Ship fast, find out fast. Vercel deploys, GitHub Actions checks, Sentry catches, PostHog counts. Bun because I don't like waiting.",
    items: [
      { name: "GitHub", note: "Version control, Actions for CI." },
      { name: "Docker", note: "Via OrbStack. Mostly for a local Postgres." },
      { name: "Cloudflare", note: "DNS, CDN, and R2 for files." },
      { name: "PostHog", note: "Product analytics and feature flags." },
      { name: "Sentry", note: "Tells me before the users do." },
      { name: "Bun", note: "Faster installs, faster runtime, less waiting." },
    ],
  },
  {
    category: "Data Science",
    description:
      "Bachelor's in Data Science from Noroff, on the side. The stats get used: retention analysis at trale.ai, not just assignments.",
    items: [
      { name: "Python", note: "The language for anything with a dataset." },
      { name: "Jupyter", note: "Where the analysis happens before it becomes a feature." },
      { name: "pandas", note: "Every dataset goes through a DataFrame first." },
      { name: "scikit-learn", note: "Classical ML. Regression before anything fancy." },
      { name: "SQL", note: "Written by hand. I like to see the query." },
    ],
  },
  {
    category: "Design & Media",
    description: "I make my own assets, recordings and videos. Good enough that nobody asks who made them.",
    items: [
      { name: "Premiere Pro", note: "Product videos and launch clips." },
      { name: "Screen Studio", note: "Screen recordings that don't look like screen recordings." },
      { name: "Canva", note: "Quick assets when Figma is overkill." },
    ],
  },
  {
    category: "Next up",
    description: "Two languages I want to ship something real in. They're not on the CV until I have.",
    items: [
      { name: "Go", note: "Small, fast services. The next thing I ship in." },
      { name: "Rust", note: "Slowly. Mostly for the discipline." },
    ],
  },
];

const HERO_TITLE = "Stack. The tools I build with.";
const OUTRO_TITLE = "Stack. That's the toolbox.";

const globeItems = stack.flatMap((section) =>
  section.items.map((item) => ({ ...item, category: section.category })),
);

const outroLink =
  "font-display text-2xl font-semibold uppercase leading-none tracking-wide underline decoration-2 underline-offset-[6px] transition-opacity hover:opacity-60 md:text-4xl";

export default function StackPage() {
  return (
    <>
      <SectionTitle initial={HERO_TITLE} tuckOnPhones />
      {/* The globe owns the first screen; the headline sits in the header like on the projects page */}
      <section data-section-title={HERO_TITLE} className="h-svh min-h-[600px] w-full px-5 pt-28 md:px-0 md:pt-24">
        <StackGlobe items={globeItems} />
      </section>
      <section id="stack-list" className="mx-auto max-w-3xl px-6 py-8 scroll-mt-24">
        <div className="space-y-16">
          {stack.map((section) => (
            <div key={section.category} data-section-title={`Stack. ${section.category}.`}>
              <StackSection
                category={section.category}
                description={section.description}
                items={section.items}
              />
            </div>
          ))}
        </div>
      </section>

      {/* The list ends the way the projects page does: a line in my voice and a door to the next room. */}
      <section
        data-section-title={OUTRO_TITLE}
        className="mx-auto max-w-3xl px-6 pb-10 pt-28 md:pt-36"
      >
        <p className="font-mono text-xs text-muted-foreground">
          Missing the one you need? Most of this list was learned on the job. The next one will be too.
        </p>
        <div className="mt-5 flex flex-wrap items-baseline gap-x-8 gap-y-3">
          <a href="mailto:marcruud@gmail.com" className={outroLink}>
            Email <span aria-hidden="true">↗</span>
          </a>
          <TransitionLink href="/projects" className={outroLink}>
            See it used <span aria-hidden="true">→</span>
          </TransitionLink>
        </div>
      </section>
    </>
  );
}
