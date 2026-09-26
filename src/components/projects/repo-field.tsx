import type { GitHubRepo } from "@/lib/github";

type Repo = GitHubRepo & { commits?: number };

const SHORT: Record<string, string> = {
  TypeScript: "TS",
  JavaScript: "JS",
  Python: "PY",
  Rust: "RS",
  Go: "GO",
  HTML: "HTML",
  CSS: "CSS",
  Shell: "SH",
  Swift: "SW",
  Kotlin: "KT",
  Java: "JV",
  "C++": "C++",
  C: "C",
  "Jupyter Notebook": "IPYNB",
};

/** Small deterministic hash so the scatter is stable between renders. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

/**
 * Repos as a scattered field of round stickers, sized by how much work went
 * into each one. It is a grid underneath, so it reflows on phones.
 */
export function RepoField({ repos }: { repos: Repo[] }) {
  if (repos.length === 0) {
    return <p className="font-mono text-sm text-muted-foreground">GitHub is not answering right now. Check back later.</p>;
  }

  const max = Math.max(1, ...repos.map((r) => r.commits ?? 0));

  return (
    <ul className="grid grid-cols-2 gap-x-2 gap-y-10 sm:grid-cols-3 md:grid-cols-4 md:gap-y-16">
      {repos.map((repo, i) => {
        const c = repo.commits ?? 0;
        const size = 58 + 42 * (Math.log(c + 1) / Math.log(max + 1));
        const jx = (hash(repo.name) - 0.5) * 28;
        const jy = (hash(repo.name + "y") - 0.5) * 24;
        const lang = repo.language ? (SHORT[repo.language] ?? repo.language.slice(0, 2).toUpperCase()) : "—";
        const lift = i % 3 === 1 ? "md:mt-20" : i % 3 === 2 ? "md:mt-8" : "";
        return (
          <li key={repo.name} className={`flex justify-center ${lift}`}>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${repo.name} on GitHub`}
              className="group flex w-full flex-col items-center"
              style={{ transform: `translate(${jx}%, ${jy}%)` }}
            >
              <span
                className="flex aspect-square items-center justify-center rounded-full bg-secondary font-mono text-lg font-bold text-muted-foreground transition-all duration-300 group-hover:scale-105 group-hover:bg-foreground group-hover:text-background md:text-xl"
                style={{ width: `${size}%` }}
              >
                {lang}
              </span>
              <span className="mt-3 max-w-full truncate font-mono text-xs font-bold">{repo.name}</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                [{repo.language ?? "misc"}{c > 0 ? ` · ${c}` : ""}]
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
