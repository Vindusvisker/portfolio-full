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
