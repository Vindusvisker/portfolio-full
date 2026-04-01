"use client";

import { Star, Globe } from "lucide-react";
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

export function ProjectCard({ repo }: { repo: GitHubRepo }) {
  return (
    <div className="group flex items-center gap-4 rounded-lg px-3 py-2 transition-colors hover:bg-accent">
      <a
        href={repo.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-sm font-medium group-hover:text-primary transition-colors cursor-pointer"
      >
        {repo.name}
      </a>
      <span className="h-px flex-1 bg-border/50" />
      <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
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
        {repo.stargazers_count > 0 && (
          <span className="flex items-center gap-1">
            <Star size={12} aria-hidden="true" />
            {repo.stargazers_count}
          </span>
        )}
      </div>
    </div>
  );
}
