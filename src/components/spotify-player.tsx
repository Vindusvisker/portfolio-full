"use client";

import Image from "next/image";
import { Music, Play, Pause } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SpotifyTrack } from "@/lib/spotify";

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

export function SpotifyPlayer() {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/spotify")
      .then((res) => res.json())
      .then((data) => {
        setTracks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function togglePlay(index: number, previewUrl: string | null) {
    if (!previewUrl) return;

    if (playingIndex === index) {
      audioRef.current?.pause();
      setPlayingIndex(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(previewUrl);
    audio.volume = 0.4;
    audioRef.current = audio;
    setPlayingIndex(index);

    audio.play();
    audio.onended = () => setPlayingIndex(null);
  }

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  if (loading) {
    return (
      <div>
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Music size={16} className="text-primary" />
          Recently Played
        </h3>
        <div className="mt-4 space-y-1" role="status" aria-label="Loading tracks">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg p-2">
              <div className="skeleton h-11 w-11 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton h-3 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
              <div className="skeleton h-3 w-10 shrink-0 rounded" />
            </div>
          ))}
          <span className="sr-only">Loading recently played tracks...</span>
        </div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Music size={16} className="text-primary" />
          Recently Played
        </h3>
        <p className="mt-4 text-xs text-muted-foreground">
          Spotify not configured yet.
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
          <div
            key={`${track.title}-${i}`}
            className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
          >
            <button
              type="button"
              className="relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-md active:scale-[0.95]"
              onClick={() => togglePlay(i, track.previewUrl)}
              aria-label={playingIndex === i ? `Pause ${track.title}` : `Play preview of ${track.title}`}
              disabled={!track.previewUrl}
            >
              <Image
                src={track.albumImageUrl}
                alt={track.album}
                fill
                sizes="44px"
                className="object-cover"
              />
              {track.previewUrl && (
                <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${playingIndex === i ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                  {playingIndex === i ? (
                    <Pause size={16} className="text-white" />
                  ) : (
                    <Play size={16} className="text-white" />
                  )}
                </div>
              )}
            </button>
            <a
              href={track.songUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 cursor-pointer"
            >
              <p className="truncate text-xs font-medium hover:underline">
                {track.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {track.artist}
              </p>
            </a>
            <span className="shrink-0 text-xs text-muted-foreground">
              {timeAgo(track.playedAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
