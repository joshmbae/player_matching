import { NextRequest, NextResponse } from "next/server";
import { wikidataProvider } from "@/providers";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const clubs = await wikidataProvider.searchClubs(query);
    return NextResponse.json(clubs);
  } catch (error) {
    console.error("Club search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
