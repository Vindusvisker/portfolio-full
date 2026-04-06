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
        headers: { Accept: "application/vnd.github.v3+json" },
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


export async function getPublicRepos(): Promise<(GitHubRepo & { commits: number })[]> {
  try {
    const response = await fetch(
      "https://api.github.com/users/vindusvisker/repos?per_page=100&sort=pushed&direction=desc",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) return [];

    const repos: GitHubRepo[] = await response.json();
    const filtered = repos.filter((repo) => !repo.fork);

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
