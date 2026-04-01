import { getPublicRepos } from "@/lib/github";
import { ProjectCard } from "@/components/project-card";
import { Boxes } from "@/components/ui/background-boxes";
import type { Metadata } from "next";
import type { GitHubRepo } from "@/lib/github";

export const metadata: Metadata = {
  title: "Projects - Marcus Ruud",
  description:
    "Open source projects and repositories by Marcus Ruud.",
};

export const revalidate = 3600;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function groupByYearMonth(repos: GitHubRepo[]) {
  const sorted = [...repos].sort(
    (a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
  );

  const groups: { label: string; repos: GitHubRepo[] }[] = [];
  let currentLabel = "";

  for (const repo of sorted) {
    const date = new Date(repo.pushed_at);
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
  const repos = await getPublicRepos();
  const groups = groupByYearMonth(repos);

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
        </div>
      </section>
    </div>
    <section className="mx-auto max-w-3xl px-6 py-8">
      <div className="mt-10 space-y-8">
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
