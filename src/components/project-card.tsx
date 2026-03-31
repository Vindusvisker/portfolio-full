import { Star, ExternalLink } from "lucide-react";
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
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl border border-border/50 bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-md cursor-pointer active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
          {repo.name}
        </h3>
        <ExternalLink
          size={14}
          className="mt-0.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>
      {repo.description && (
        <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {repo.description}
        </p>
      )}
      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
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
    </a>
  );
}
