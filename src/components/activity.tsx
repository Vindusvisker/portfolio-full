import { GitHubActivity } from "./github-activity";
import { SpotifyPlayer } from "./spotify-player";
import { BlurFade } from "./ui/blur-fade";

export function Activity() {
  return (
    <section className="mt-16 mx-auto max-w-3xl px-6">
      <BlurFade delay={0.1} inView>
        <div className="w-full">
          <GitHubActivity />
        </div>
      </BlurFade>
      <BlurFade delay={0.2} inView>
        <div className="mt-12">
          <SpotifyPlayer />
        </div>
      </BlurFade>
    </section>
  );
}
