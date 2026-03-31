import { GitHubActivity } from "./github-activity";
import { SpotifyPlayer } from "./spotify-player";

export function Activity() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h2 className="slide-enter text-lg font-bold">Activity</h2>
      <div className="slide-enter slide-enter-delay-1 mt-8 w-full">
        <GitHubActivity />
      </div>
      <div className="slide-enter slide-enter-delay-2 mt-12">
        <SpotifyPlayer />
      </div>
    </section>
  );
}
