export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
  topics: string[];
  pushed_at: string;
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
      { next: { revalidate: 3600 } }
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

export async function getPublicRepos(): Promise<GitHubRepo[]> {
  try {
    const response = await fetch(
      "https://api.github.com/users/vindusvisker/repos?per_page=100&sort=pushed&direction=desc",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) return [];

    const repos: GitHubRepo[] = await response.json();
    return repos.filter((repo) => !repo.fork);
  } catch {
    return [];
  }
}
