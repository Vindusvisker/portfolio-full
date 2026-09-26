import { Board } from "@/components/board/board";

// Live stickers (GitHub, Spotify) refresh every ten minutes.
export const revalidate = 600;

export default function Home() {
  return (
    // No fixed headline here: the badge and the note carry the name.
    <Board />
  );
}
