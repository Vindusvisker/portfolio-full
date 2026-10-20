import { Board } from "@/components/board/board";
import { DiveIntro } from "@/components/life/dive-intro";

// Live stickers (GitHub, Spotify) refresh every ten minutes.
export const revalidate = 600;

export default function Home() {
  return (
    <DiveIntro src="/home/hero-scrub.mp4" poster="/home/hero-poster.jpg" ending="/home/hero-ending.jpg">
      <Board />
    </DiveIntro>
  );
}
