"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { SpotifyTrack } from "@/lib/spotify";

let cached: SpotifyTrack[] | null = null;

function timeAgo(dateString: string): string {
  const minutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** What I've had on lately, pulled from Spotify when the bubble opens. */
export function SpotifyBubble() {
  const [tracks, setTracks] = useState<SpotifyTrack[] | null>(cached);

  useEffect(() => {
    if (cached) return;
    fetch("/api/spotify")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SpotifyTrack[]) => {
        cached = data;
        setTracks(data);
      })
      .catch(() => setTracks([]));
  }, []);

  return (
    <div className="text-left font-normal">
      <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-white/60">♫ Recently played</p>
      {tracks === null ? (
        <p className="text-sm text-white/60">Loading…</p>
      ) : tracks.length === 0 ? (
        <p className="text-sm text-white/60">Quiet in here. Suspicious.</p>
      ) : (
        <ul className="space-y-2">
          {tracks.slice(0, 4).map((track) => (
            <li key={track.playedAt}>
              <a
                href={track.songUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 transition-opacity hover:opacity-70"
              >
                {track.albumImageUrl ? (
                  <Image
                    src={track.albumImageUrl}
                    alt=""
                    width={36}
                    height={36}
                    className="h-9 w-9 shrink-0 rounded-md"
                    draggable={false}
                  />
                ) : (
                  <span className="h-9 w-9 shrink-0 rounded-md bg-white/10" />
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{track.title}</span>
                  <span className="block truncate text-xs text-white/60">
                    {track.artist} · {timeAgo(track.playedAt)}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
