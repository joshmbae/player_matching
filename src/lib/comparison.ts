import type { ClubPlayerEntry, ComparisonResult, CommonPlayer, Club, CareerEntry } from "@/types";

export function buildComparison(
  clubA: Club,
  clubB: Club,
  playersA: ClubPlayerEntry[],
  playersB: ClubPlayerEntry[]
): ComparisonResult {
  const idsB = new Set(playersB.map((e) => e.player.id));
  const idsA = new Set(playersA.map((e) => e.player.id));

  const commonPlayers: CommonPlayer[] = [];

  for (const entryA of playersA) {
    if (!idsB.has(entryA.player.id)) continue;

    const matchingB = playersB.filter((e) => e.player.id === entryA.player.id);
    for (const entryB of matchingB) {
      commonPlayers.push({
        player: entryA.player,
        entryA: entryA.clubEntry,
        entryB: entryB.clubEntry,
      });
    }
  }

  const dedupedCommon = deduplicateCommon(commonPlayers);
  const commonIds = new Set(dedupedCommon.map((c) => c.player.id));

  return {
    clubA,
    clubB,
    playersA: playersA.map((e) => ({
      ...e,
      player: { ...e.player, _isCommon: commonIds.has(e.player.id) } as typeof e.player,
    })),
    playersB: playersB.map((e) => ({
      ...e,
      player: { ...e.player, _isCommon: commonIds.has(e.player.id) } as typeof e.player,
    })),
    commonPlayers: dedupedCommon,
  };
}

function deduplicateCommon(entries: CommonPlayer[]): CommonPlayer[] {
  const seen = new Set<string>();
  return entries.filter((e) => {
    const key = `${e.player.id}-${e.entryA.startYear ?? ""}-${e.entryB.startYear ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getDurationYears(entry: CareerEntry): number {
  const start = entry.startYear ?? 0;
  const end = entry.endYear ?? new Date().getFullYear();
  return Math.max(0, end - start);
}

export function sortEntries(
  entries: ClubPlayerEntry[],
  field: "name" | "startDate" | "endDate" | "duration",
  dir: "asc" | "desc"
): ClubPlayerEntry[] {
  return [...entries].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case "name":
        cmp = a.player.name.localeCompare(b.player.name, "de");
        break;
      case "startDate":
        cmp = (a.clubEntry.startYear ?? 9999) - (b.clubEntry.startYear ?? 9999);
        break;
      case "endDate":
        cmp = (a.clubEntry.endYear ?? 9999) - (b.clubEntry.endYear ?? 9999);
        break;
      case "duration":
        cmp = getDurationYears(b.clubEntry) - getDurationYears(a.clubEntry);
        break;
    }
    return dir === "asc" ? cmp : -cmp;
  });
}
