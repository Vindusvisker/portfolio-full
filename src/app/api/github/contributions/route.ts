import { getContributions } from "@/lib/github";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const year = request.nextUrl.searchParams.get("year");
  const data = await getContributions(year ? parseInt(year) : undefined);
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}
