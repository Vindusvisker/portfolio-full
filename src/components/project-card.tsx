"use client";

import { Globe, GitCommit } from "lucide-react";
import type { GitHubRepo } from "@/lib/github";

const languageColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Rust: "bg-orange-600",
  Go: "bg-cyan-500",
  HTML: "bg-red-500",
  CSS: "bg-purple-500",
};

export function ProjectCard({ repo }: { repo: GitHubRepo & { commits?: number } }) {
  return (
    <div className="group flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg px-3 py-2 transition-colors hover:bg-accent">
      <a
        href={repo.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-sm font-medium group-hover:text-primary transition-colors cursor-pointer"
      >
        {repo.name}
      </a>
      <span className="hidden h-px flex-1 bg-border/50 sm:block" />
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {repo.homepage && (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe size={12} aria-hidden="true" />
            Live
          </a>
        )}
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                languageColors[repo.language] ?? "bg-gray-400"
              }`}
            />
            {repo.language}
          </span>
        )}
        {repo.commits && repo.commits > 0 && (
          <span className="flex items-center gap-1">
            <GitCommit size={12} aria-hidden="true" />
            {repo.commits}
          </span>
        )}
      </div>
    </div>
  );
}
