import { getPublicRepos, getTotalContributions } from "@/lib/github";
import { Dock } from "@/components/projects/dock";
import { Graveyard } from "@/components/projects/graveyard";
import { PaperMode } from "@/components/projects/paper-mode";
import { graveyardPrint } from "@/lib/graveyard-print";
import { groupRepos } from "@/lib/repo-groups";
import { Reel } from "@/components/projects/reel";
import { Buried } from "@/components/projects/buried";
import { RepoSpiral } from "@/components/projects/repo-spiral";
import { SectionTitle } from "@/components/projects/section-title";
import { Wash } from "@/components/projects/wash";
import { WorkGrid, type WorkItem } from "@/components/projects/work-grid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects - Marcus Ruud",
  description: "Products Marcus Ruud has shipped, and the open source behind them.",
};

export const revalidate = 300;

const work: WorkItem[] = [
  {
    name: "trale.ai",
    status: "Production",
    note: "AI meeting intelligence platform at Supercompany. Records, transcribes and summarizes meetings, then handles prep and follow-up. Thousands of users.",
    href: "https://trale.ai",
    image: "/projects/trale-print.jpg",
    plate: "#122347",
    brightness: 0.06,
    fit: "contain",
    aspect: "aspect-[2/3]",
    place: "md:col-span-5 md:col-start-2",
  },
  {
    name: "lerret.app",
    status: "Production",
    note: "Browser based editor for screenshots and device mockups. 35 devices, annotations, and image or 60 fps video export, all rendered in the browser.",
    href: "https://lerret.app",
    image: "/projects/lerret-print.jpg",
    plate: "#211b31",
    brightness: 0.1,
    aspect: "aspect-[3/2]",
    place: "md:col-span-8 md:col-start-4 md:mt-[4vh] lg:mt-[6vh]",
  },
  {
    name: "personaforge.me",
    status: "Sold",
    note: "Persona and profile card editor. Templates, a visual editor, and export to PNG, JPG, WebP, HTML/CSS or JSX. Built, launched, and sold on.",
    href: "",
    image: "/projects/personaforge-print.jpg",
    plate: "#1c1b1f",
    brightness: 0.06,
    aspect: "aspect-[1600/1514]",
    place: "md:col-span-6 md:col-start-2 lg:mt-[12vh]",
  },
];

const lately = [
  { label: "trale.ai", status: "Production", href: "https://trale.ai" },
  { label: "lerret.app", status: "Production, for sale", href: "https://lerret.app" },
  { label: "personaforge.me", status: "Sold", href: "" },
];

const contact = [
  { label: "marcruud@gmail.com", href: "mailto:marcruud@gmail.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/marcus-ruud-25936a260/" },
  { label: "GitHub", href: "https://github.com/vindusvisker" },
];

export default async function ProjectsPage() {
  const [repos, totalContributions] = await Promise.all([getPublicRepos(), getTotalContributions()]);
  const sorted = [...repos].sort((a, b) => (b.commits ?? 0) - (a.commits ?? 0));
  const groups = groupRepos(repos);

  const titles = {
    hero: "Projects. Things I've shipped.",
    work: "Two products in production. One built and sold.",
    repos: `Open source. ${repos.length} repos in the graveyard.`,
    contact: "Let's build something.",
  };

  return (
    <>
      <SectionTitle initial={titles.hero} />
      <Dock />
      {/* Paper mode before first paint on a hard load. */}
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('paper')" }} />
      <PaperMode />

      <div data-section-title={titles.hero}>
        <Reel
          items={[
            { src: "/projects/trale.jpg", alt: "trale.ai landing page" },
            { src: "/projects/lerret.jpg", alt: "The lerret.app editor with a screenshot framed in a browser window" },
            { src: "/projects/personaforge.jpg", alt: "PersonaForge landing page with a fan of persona cards" },
          ]}
        />
      </div>

      <section data-section-title={titles.work} className="relative px-5 pb-24 pt-[30svh] md:px-8 md:pb-[24vh]">
        <Wash colors={work.map((w) => w.plate)} />
        <div className="relative z-10">
        <div className="mb-16 grid gap-6 md:mb-20 md:grid-cols-2">
          <div className="font-mono text-base font-bold leading-snug md:text-lg">
            <h2 className="mb-2 font-medium text-muted-foreground">Lately</h2>
            <ul>
              {lately.map((it) => (
                <li key={it.label}>
                  {it.href ? (
                    <a
                      href={it.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-opacity hover:opacity-60"
                    >
                      {it.label} <span className="font-medium text-muted-foreground">({it.status})</span> →
                    </a>
                  ) : (
                    <span>
                      {it.label} <span className="font-medium text-muted-foreground">({it.status})</span>
                    </span>
                  )}
                </li>
              ))}
              <li>
                <a
                  href="https://github.com/vindusvisker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-60"
                >
                  {repos.length} public repos{" "}
                  <span className="font-medium text-muted-foreground">
                    ({totalContributions.toLocaleString("en-US")} contributions)
                  </span>{" "}
                  →
                </a>
              </li>
            </ul>
          </div>
        </div>
        <WorkGrid items={work} />
        </div>
      </section>

      <section id="graveyard" data-section-title={titles.repos} className="paper-sheet relative pb-10 pt-[20svh]">
        <div className="paper-grain pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-5 md:px-8">
          <Graveyard src={graveyardPrint(sorted, totalContributions)} />
          {repos.length === 0 && (
            <p className="mt-24 font-mono text-sm text-muted-foreground">GitHub is not answering right now. Check back later.</p>
          )}
        </div>
        {repos.length > 0 && (
          <div className="relative mt-8 md:mt-12">
            <RepoSpiral active={groups.active} dormant={groups.dormant} />
          </div>
        )}
        {groups.buried.length > 0 && (
          <div className="relative mt-24 md:mt-32">
            <Buried rows={groups.buried} />
          </div>
        )}
      </section>

      <section
        data-section-title={titles.contact}
        className="flex min-h-svh flex-col justify-end overflow-hidden px-5 pb-4 pt-32 md:px-8"
      >
        <div className="mx-auto w-full max-w-6xl">
          <p className="font-mono text-xs text-muted-foreground">Oslo, Norway. I read every email.</p>
          <ul className="mt-4 space-y-1.5 font-mono text-xl font-bold md:text-3xl">
            {contact.map((it) => (
              <li key={it.href}>
                <a
                  href={it.href}
                  target={it.href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="underline decoration-border underline-offset-8 transition-colors hover:decoration-foreground"
                >
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p
          aria-hidden="true"
          className="mt-16 w-full select-none whitespace-nowrap text-center font-mono font-bold leading-[0.82] tracking-[-0.04em] md:mt-24"
          style={{ fontSize: "clamp(56px, calc((100vw - 2.5rem) / 6.4), 340px)" }}
        >
          MARCUS RUUD
        </p>
      </section>
    </>
  );
}
