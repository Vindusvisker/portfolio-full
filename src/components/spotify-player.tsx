import { getRecentlyPlayed } from "@/lib/spotify";
import Image from "next/image";
import { Music } from "lucide-react";

function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export async function SpotifyPlayer() {
  const tracks = await getRecentlyPlayed();

  if (tracks.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-medium">Recently Played</h3>
        <p className="mt-4 text-xs text-muted-foreground">
          Spotify integration not configured. Add your credentials to .env to
          enable this.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Music size={16} className="text-primary" />
        Recently Played
      </h3>
      <div className="mt-4 space-y-1">
        {tracks.map((track, i) => (
          <a
            key={`${track.title}-${i}`}
            href={track.songUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
              <Image
                src={track.albumImageUrl}
                alt={track.album}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{track.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {track.artist}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {timeAgo(track.playedAt)}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
