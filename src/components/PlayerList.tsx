"use client";

import { useMemo, useState } from "react";
import type { ClubPlayerEntry, FilterOptions, Player, SortDirection, SortField } from "@/types";
import { sortEntries } from "@/lib/comparison";
import { PlayerCard } from "./PlayerCard";
import { PlayerModal } from "./PlayerModal";

interface PlayerListProps {
  entries: ClubPlayerEntry[];
  commonIds: Set<string>;
  accentColor: "blue" | "yellow";
  filters: FilterOptions;
  clubName: string;
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "startDate", label: "Beginn" },
  { value: "endDate", label: "Ende" },
  { value: "duration", label: "Dauer" },
];

export function PlayerList({ entries, commonIds, accentColor, filters, clubName }: PlayerListProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const accent = accentColor === "blue"
    ? { active: "bg-blue-600 text-white", inactive: "text-blue-700 hover:bg-blue-50" }
    : { active: "bg-yellow-500 text-white", inactive: "text-yellow-700 hover:bg-yellow-50" };

  const filtered = useMemo(() => {
    let result = [...entries];

    if (filters.onlyCommon) {
      result = result.filter((e) => commonIds.has(e.player.id));
    }
    if (filters.onlyWithDates) {
      result = result.filter((e) => e.clubEntry.startYear || e.clubEntry.endYear);
    }
    if (filters.startYearMin !== undefined) {
      result = result.filter((e) => !e.clubEntry.startYear || e.clubEntry.startYear >= filters.startYearMin!);
    }
    if (filters.startYearMax !== undefined) {
      result = result.filter((e) => !e.clubEntry.startYear || e.clubEntry.startYear <= filters.startYearMax!);
    }

    return sortEntries(result, sortField, sortDir);
  }, [entries, commonIds, filters, sortField, sortDir]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  function toggleSort(field: SortField) {
    if (field === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
    setPage(1);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {filtered.length} Spieler
            {filters.onlyCommon && " (gemeinsam)"}
          </span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleSort(opt.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${sortField === opt.value ? accent.active : `bg-white border border-gray-200 ${accent.inactive}`}`}
            >
              {opt.label}
              {sortField === opt.value && (sortDir === "asc" ? " ↑" : " ↓")}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">
            Keine Spieler für diese Filter.
          </div>
        ) : (
          <>
            {paginated.map((entry, i) => (
              <PlayerCard
                key={`${entry.player.id}-${i}`}
                entry={entry}
                isCommon={commonIds.has(entry.player.id)}
                accentColor={accentColor}
                onClick={() => setSelectedPlayer(entry.player)}
              />
            ))}
            {hasMore && (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Weitere {filtered.length - paginated.length} Spieler laden…
              </button>
            )}
          </>
        )}
      </div>

      {selectedPlayer && (
        <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
}
