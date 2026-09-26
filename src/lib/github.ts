/**
 * Headers for the GitHub REST API. With GITHUB_TOKEN set the limit is 5,000
 * requests an hour instead of 60 per IP, which the projects page burns
 * through quickly since it fetches a commit count per repo.
 */
function githubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github.v3+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
  topics: string[];
  pushed_at: string;
  created_at: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0-4
}

export interface ContributionData {
  total: number;
  days: ContributionDay[];
}

export async function getContributions(year?: number): Promise<ContributionData> {
  try {
    const y = year || new Date().getFullYear();
    const response = await fetch(
      `https://github-contributions-api.jogruber.de/v4/vindusvisker?y=${y}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) return { total: 0, days: [] };

    const data = await response.json();

    const days: ContributionDay[] = data.contributions.map(
      (c: { date: string; count: number; level: number }) => ({
        date: c.date,
        count: c.count,
        level: c.level,
      })
    );

    return {
      total: data.total?.lastYear ?? days.reduce((sum: number, d: ContributionDay) => sum + d.count, 0),
      days,
    };
  } catch {
    return { total: 0, days: [] };
  }
}

async function getCommitCount(owner: string, repo: string): Promise<number> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
      {
        headers: githubHeaders(),
        next: { revalidate: 300 },
      }
    );
    if (!response.ok) return 0;
    const link = response.headers.get("link");
    if (!link) {
      const data = await response.json();
      return Array.isArray(data) ? data.length : 0;
    }
    const match = link.match(/page=(\d+)>; rel="last"/);
    return match ? parseInt(match[1], 10) : 1;
  } catch {
    return 0;
  }
}

export async function getTotalContributions(): Promise<number> {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2023 }, (_, i) => currentYear - i);
  const results = await Promise.all(years.map((y) => getContributions(y)));
  return results.reduce((sum, r) => sum + r.total, 0);
}


/** Repos that should not show up anywhere on the site, e.g. products that were sold on. */
const HIDDEN_REPOS = new Set(["personaforge"]);

export async function getPublicRepos(): Promise<(GitHubRepo & { commits: number })[]> {
  try {
    const response = await fetch(
      "https://api.github.com/users/vindusvisker/repos?per_page=100&sort=pushed&direction=desc",
      {
        headers: githubHeaders(),
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) return [];

    const repos: GitHubRepo[] = await response.json();
    const filtered = repos.filter((repo) => !repo.fork && !HIDDEN_REPOS.has(repo.name));

    const withCommits = await Promise.all(
      filtered.map(async (repo) => ({
        ...repo,
        commits: await getCommitCount("vindusvisker", repo.name),
      }))
    );

    return withCommits;
  } catch {
    return [];
  }
}

export interface GitHubPulse {
  /** Commits in the last 7 days, from the contribution calendar (includes private work) */
  weekCommits: number;
  /** Contributions over the last year */
  yearCommits: number;
  /** Consecutive days with at least one contribution, ending today or yesterday */
  streak: number;
}

/** Activity summary for the home board, from the contribution calendar only. */
export async function getPulse(): Promise<GitHubPulse> {
  const contrib = await getContributions();
  const days = [...contrib.days].sort((a, b) => a.date.localeCompare(b.date));
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekCommits = days.filter((d) => new Date(d.date).getTime() >= cutoff).reduce((sum, d) => sum + d.count, 0);

  const today = new Date().toISOString().slice(0, 10);
  const past = days.filter((d) => d.date <= today);
  let streak = 0;
  for (let i = past.length - 1; i >= 0; i--) {
    if (past[i].count > 0) streak += 1;
    else if (i === past.length - 1) continue; // today can still be empty
    else break;
  }
  return { weekCommits, yearCommits: contrib.total, streak };
}
