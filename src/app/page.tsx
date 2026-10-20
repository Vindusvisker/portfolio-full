import { Board } from "@/components/board/board";
import { VideoIntro } from "@/components/intro/video-intro";

// Live stickers (GitHub, Spotify) refresh every ten minutes.
export const revalidate = 600;

export default function Home() {
  return (
    <VideoIntro
      src="/home/hero-scrub.mp4"
      poster="/home/hero-poster.jpg"
      ending="/home/hero-ending.jpg"
      greeting="Hey, I'm Marcus!"
      greetingWindow={{ from: 0.35, to: 2.45 }}
    >
      <Board />
    </VideoIntro>
  );
}
