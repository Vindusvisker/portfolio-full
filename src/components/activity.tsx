import { GitHubActivity } from "./github-activity";
import { SpotifyPlayer } from "./spotify-player";
import { Suspense } from "react";

export function Activity() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h2 className="slide-enter text-lg font-bold">Activity</h2>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="slide-enter slide-enter-delay-1">
          <GitHubActivity />
        </div>
        <div className="slide-enter slide-enter-delay-2">
          <Suspense
            fallback={
              <div className="text-xs text-muted-foreground">
                Loading tracks...
              </div>
            }
          >
            <SpotifyPlayer />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
