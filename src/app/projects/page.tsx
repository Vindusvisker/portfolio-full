import { getPublicRepos } from "@/lib/github";
import { ProjectCard } from "@/components/project-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects - Marcus Ruud",
  description:
    "Open source projects and repositories by Marcus Ruud.",
};

export const revalidate = 3600;

export default async function ProjectsPage() {
  const repos = await getPublicRepos();

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="slide-enter">
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
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {repos.map((repo, i) => (
          <div
            key={repo.name}
            className={`slide-enter slide-enter-delay-${Math.min(i + 1, 6)}`}
          >
            <ProjectCard repo={repo} />
          </div>
        ))}
        {repos.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">
            Unable to load repositories. Check back later.
          </p>
        )}
      </div>
    </section>
  );
}
