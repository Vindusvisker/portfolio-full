import { getRecentlyPlayed } from "@/lib/spotify";
import { NextResponse } from "next/server";

// Must be dynamic: with `revalidate` alone this GET handler has no dynamic
// inputs, so Next prerenders it at build time and ships a snapshot of the
// listening history. Caching is handled by the CDN via Cache-Control instead.
export const dynamic = "force-dynamic";

export async function GET() {
  const tracks = await getRecentlyPlayed();
  return NextResponse.json(tracks, {
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
    },
  });
}
