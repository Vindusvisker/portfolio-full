/* eslint-disable @next/next/no-img-element */

export function GitHubActivity() {
  return (
    <div>
      <h3 className="text-sm font-medium">GitHub Contributions</h3>
      <div className="mt-4 overflow-hidden rounded-lg border border-border/50 bg-card">
        <a
          href="https://github.com/vindusvisker"
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4"
        >
          <img
            src="https://ghchart.rshah.org/vindusvisker"
            alt="GitHub contribution chart for vindusvisker"
            className="w-full dark:invert dark:hue-rotate-180"
          />
        </a>
      </div>
    </div>
  );
}
