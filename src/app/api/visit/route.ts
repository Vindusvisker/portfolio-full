import { NextResponse } from "next/server";
import { getVisits, incrementVisits } from "@/lib/visits";

export const dynamic = "force-dynamic";

/** Count a visit. Returns the visitor's number, or null when no store is configured. */
export async function POST() {
  return NextResponse.json({ n: await incrementVisits() });
}

export async function GET() {
  return NextResponse.json({ n: await getVisits() });
}
