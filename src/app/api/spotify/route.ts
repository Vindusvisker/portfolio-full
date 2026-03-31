import { getRecentlyPlayed } from "@/lib/spotify";
import { NextResponse } from "next/server";

export const revalidate = 600;

export async function GET() {
  const tracks = await getRecentlyPlayed();
  return NextResponse.json(tracks);
}
