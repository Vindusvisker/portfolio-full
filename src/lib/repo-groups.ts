import type { GitHubRepo } from "@/lib/github";

export type Repo = GitHubRepo & { commits?: number };

/** A repo row, flattened for the client and the paper. */
export interface RepoRow {
  id: string;
  name: string;
  description: string;
  language: string;
  commits: number;
  ago: string;
  /** "Mar 2023": when the repo was created. */
  born: string;
  /** "Jul 2024": the last push. */
  lastSeen: string;
  href: string;
  homepage: string | null;
}

export interface RepoGroups {
  /** Pushed within the last four months. */
  active: RepoRow[];
  /** Pushed within the last year. */
  dormant: RepoRow[];
  /** Not touched in over a year. These get shredded. */
  buried: RepoRow[];
}

const DAY = 86_400_000;

function ago(iso: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / DAY));
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

const monthYear = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

function toRow(r: Repo): RepoRow {
  return {
    id: r.name,
    name: r.name,
    description: r.description ?? "",
    language: r.language ?? "misc",
    commits: r.commits ?? 0,
    ago: ago(r.pushed_at),
    born: monthYear(r.created_at),
    lastSeen: monthYear(r.pushed_at),
    href: r.html_url,
    homepage: r.homepage || null,
  };
}

/**
 * Sort repos by how recently they were pushed. If fewer than three are older
 * than a year, the oldest five go to the graveyard so it is never empty.
 */
export function groupRepos(repos: Repo[]): RepoGroups {
  const now = Date.now();
  const byRecent = [...repos].sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime());
  const age = (r: Repo) => (now - new Date(r.pushed_at).getTime()) / DAY;

  let buried = byRecent.filter((r) => age(r) > 365);
  if (buried.length < 3) buried = byRecent.slice(-Math.min(5, byRecent.length));
  const buriedSet = new Set(buried.map((r) => r.name));

  const rest = byRecent.filter((r) => !buriedSet.has(r.name));
  const active = rest.filter((r) => age(r) <= 120);
  const dormant = rest.filter((r) => age(r) > 120);

  return { active: active.map(toRow), dormant: dormant.map(toRow), buried: buried.map(toRow) };
}
