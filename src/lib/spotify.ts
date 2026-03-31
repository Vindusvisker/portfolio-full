const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const RECENTLY_PLAYED_ENDPOINT =
  "https://api.spotify.com/v1/me/player/recently-played?limit=5";

async function getAccessToken() {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64"
  );

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN!,
    }),
  });

  return response.json();
}

export interface SpotifyTrack {
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
  playedAt: string;
}

export async function getRecentlyPlayed(): Promise<SpotifyTrack[]> {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    return [];
  }

  try {
    const { access_token } = await getAccessToken();

    const response = await fetch(RECENTLY_PLAYED_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) return [];

    const data = await response.json();

    return data.items.map(
      (item: {
        track: {
          name: string;
          artists: { name: string }[];
          album: { name: string; images: { url: string }[] };
          external_urls: { spotify: string };
        };
        played_at: string;
      }) => ({
        title: item.track.name,
        artist: item.track.artists.map((a: { name: string }) => a.name).join(", "),
        album: item.track.album.name,
        albumImageUrl: item.track.album.images[0]?.url ?? "",
        songUrl: item.track.external_urls.spotify,
        playedAt: item.played_at,
      })
    );
  } catch {
    return [];
  }
}
