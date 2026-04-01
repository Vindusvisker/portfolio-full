import { getPublicRepos, getTotalContributions } from "@/lib/github";
import { ProjectCard } from "@/components/project-card";
import { Boxes } from "@/components/ui/background-boxes";
import type { Metadata } from "next";
import type { GitHubRepo } from "@/lib/github";

export const metadata: Metadata = {
  title: "Projects - Marcus Ruud",
  description:
    "Open source projects and repositories by Marcus Ruud.",
};

export const revalidate = 300;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function groupByYearMonth(repos: GitHubRepo[]) {
  const sorted = [...repos].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const groups: { label: string; repos: GitHubRepo[] }[] = [];
  let currentLabel = "";

  for (const repo of sorted) {
    const date = new Date(repo.created_at);
    const label = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    if (label !== currentLabel) {
      groups.push({ label, repos: [] });
      currentLabel = label;
    }
    groups[groups.length - 1].repos.push(repo);
  }

  return groups;
}

export default async function ProjectsPage() {
  const [repos, totalContributions] = await Promise.all([
    getPublicRepos(),
    getTotalContributions(),
  ]);
  const groups = groupByYearMonth(repos);
  const languages = new Set(repos.map((r) => r.language).filter(Boolean));

  return (
    <>
    <div className="relative -mt-32 h-[40dvh] overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-72 bg-gradient-to-t from-background to-transparent" />
      <Boxes className="opacity-20" />
      <section className="pointer-events-none relative z-10 mx-auto flex h-full max-w-3xl flex-col justify-end px-6 pb-8 pt-32">
        <div className="pointer-events-auto slide-enter">
          <h1 className="text-2xl font-extrabold tracking-tight">Projects</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Open source work and experiments. All available on{" "}
            <a
              href="https://github.com/vindusvisker"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 transition-colors hover:text-primary/80 cursor-pointer"
            >
              GitHub
            </a>
            .
          </p>
          <div className="mt-4 flex gap-6 text-sm">
            <span className="text-foreground font-medium">{repos.length} <span className="text-muted-foreground font-normal">repos</span></span>
            <span className="text-foreground font-medium">{totalContributions.toLocaleString()} <span className="text-muted-foreground font-normal">contributions</span></span>
<span className="text-foreground font-medium">{languages.size} <span className="text-muted-foreground font-normal">languages</span></span>
          </div>
        </div>
      </section>
    </div>
    <section className="mx-auto max-w-3xl px-6 py-8">
      <div>
        <h2 className="mb-4 text-xs font-medium text-muted-foreground">Currently building</h2>
        <div className="space-y-3">
          {[
            {
              name: "trale.ai",
              description: "AI powered sales platform that automates the entire meeting lifecycle, from prep to follow up. Thousands of users.",
              href: "https://trale.ai",
              status: "Production" as const,
            },
            {
              name: "assembo.app",
              description: "Collaborative design tool for teams to build and ship faster.",
              href: "https://assembo.app",
              status: "In progress" as const,
            },
            {
              name: "relate.run",
              description: "Full stack relationship management platform.",
              href: "https://relate.run",
              status: "In progress" as const,
            },
          ].map((project) => (
            <a
              key={project.name}
              href={project.href || "#"}
              target={project.href ? "_blank" : undefined}
              rel={project.href ? "noopener noreferrer" : undefined}
              className="group flex items-center gap-4 rounded-lg border border-border/50 px-4 py-3 transition-colors hover:border-primary/30 cursor-pointer"
            >
              <span className="shrink-0 text-sm font-medium group-hover:text-primary transition-colors">{project.name}</span>
              <span className="h-px flex-1 bg-border/50" />
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                project.status === "Production"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-orange-500/10 text-orange-400"
              }`}>{project.status}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-10 space-y-8">
        <h2 className="text-xs font-medium text-muted-foreground">Open source</h2>
        {groups.map((group) => (
          <div key={group.label}>
            <h2 className="mb-3 text-xs font-medium text-muted-foreground">{group.label}</h2>
            <div className="space-y-2">
              {group.repos.map((repo) => (
                <ProjectCard key={repo.name} repo={repo} />
              ))}
            </div>
          </div>
        ))}
        {repos.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Unable to load repositories. Check back later.
          </p>
        )}
      </div>
    </section>
    </>
  );
}
