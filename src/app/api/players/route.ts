import { NextRequest, NextResponse } from "next/server";
import { wikidataProvider } from "@/providers";

export async function GET(req: NextRequest) {
  const clubId = req.nextUrl.searchParams.get("clubId");
  if (!clubId) {
    return NextResponse.json({ error: "clubId required" }, { status: 400 });
  }

  try {
    const players = await wikidataProvider.getClubPlayers(clubId);
    return NextResponse.json(players);
  } catch (error) {
    console.error("Player fetch error:", error);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
