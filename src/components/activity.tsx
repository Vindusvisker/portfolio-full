import { GitHubActivity } from "./github-activity";
import { SpotifyPlayer } from "./spotify-player";
import { BlurFade } from "./ui/blur-fade";

export function Activity() {
  return (
    <section className="mx-auto max-w-3xl px-6">
      <BlurFade delay={0.1} inView>
        <h2 className="text-lg font-bold">Activity</h2>
      </BlurFade>
      <BlurFade delay={0.2} inView>
        <div className="mt-8 w-full">
          <GitHubActivity />
        </div>
      </BlurFade>
      <BlurFade delay={0.3} inView>
        <div className="mt-12">
          <SpotifyPlayer />
        </div>
      </BlurFade>
    </section>
  );
}
