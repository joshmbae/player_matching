import { NextRequest, NextResponse } from "next/server";
import { wikidataProvider } from "@/providers";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const players = await wikidataProvider.searchPlayers(query);
    return NextResponse.json(players);
  } catch (error) {
    console.error("Player search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
