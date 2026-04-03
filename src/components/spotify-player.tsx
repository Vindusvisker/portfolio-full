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

function SoundBars() {
  return (
    <div className="flex items-end gap-[3px] h-4">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-primary"
          style={{
            animation: `soundbar 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes soundbar {
          0% { height: 4px; }
          100% { height: 16px; }
        }
      `}</style>
    </div>
  );
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
        <div className="mt-4 rounded-xl border border-border/50 bg-card p-2 space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg p-3">
              <div className="skeleton h-14 w-14 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
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
      <div className="mt-4 rounded-xl border border-border/50 bg-card p-2">
        {tracks.map((track, i) => {
          const isPlaying = playingIndex === i;
          return (
            <div
              key={`${track.title}-${i}`}
              className={`group flex items-center gap-4 rounded-lg p-3 transition-all ${
                isPlaying
                  ? "bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
            >
              <button
                type="button"
                className="relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg shadow-sm transition-transform active:scale-[0.93]"
                onClick={() => togglePlay(i, track.previewUrl)}
                aria-label={
                  isPlaying
                    ? `Pause ${track.title}`
                    : `Play preview of ${track.title}`
                }
                disabled={!track.previewUrl}
              >
                <Image
                  src={track.albumImageUrl}
                  alt={track.album}
                  fill
                  sizes="56px"
                  className={`object-cover transition-transform duration-300 ${
                    isPlaying ? "scale-110" : "group-hover:scale-105"
                  }`}
                />
                {track.previewUrl && (
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] transition-opacity ${
                      isPlaying
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {isPlaying ? (
                      <Pause size={18} className="text-white" />
                    ) : (
                      <Play size={18} className="text-white" />
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
                <p
                  className={`truncate text-sm font-medium hover:underline ${
                    isPlaying ? "text-primary" : ""
                  }`}
                >
                  {track.title}
                </p>
                <p className="truncate text-xs text-muted-foreground mt-0.5">
                  {track.artist} &middot; {track.album}
                </p>
              </a>

              <div className="shrink-0 flex flex-col items-end gap-1">
                {isPlaying ? (
                  <SoundBars />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(track.playedAt)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
