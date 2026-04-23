import { NextRequest, NextResponse } from "next/server";
import { wikidataProvider } from "@/providers";
import { buildComparison } from "@/lib/comparison";
import type { Club } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const clubAId = searchParams.get("clubAId");
  const clubBId = searchParams.get("clubBId");
  const clubAName = searchParams.get("clubAName") ?? clubAId ?? "";
  const clubBName = searchParams.get("clubBName") ?? clubBId ?? "";

  if (!clubAId || !clubBId) {
    return NextResponse.json({ error: "clubAId and clubBId required" }, { status: 400 });
  }

  try {
    const [playersA, playersB] = await Promise.all([
      wikidataProvider.getClubPlayers(clubAId),
      wikidataProvider.getClubPlayers(clubBId),
    ]);

    const clubA: Club = { id: clubAId, name: clubAName, wikidataId: clubAId };
    const clubB: Club = { id: clubBId, name: clubBName, wikidataId: clubBId };

    const result = buildComparison(clubA, clubB, playersA, playersB);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Compare error:", error);
    return NextResponse.json({ error: "Comparison failed" }, { status: 500 });
  }
}
