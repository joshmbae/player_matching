"use client";

import type { ClubPlayerEntry } from "@/types";
import { getDurationYears } from "@/lib/comparison";

interface PlayerCardProps {
  entry: ClubPlayerEntry;
  isCommon: boolean;
  accentColor: "blue" | "yellow";
  onClick: () => void;
}

export function PlayerCard({ entry, isCommon, accentColor, onClick }: PlayerCardProps) {
  const { player, clubEntry } = entry;

  const duration = getDurationYears(clubEntry);
  const periodStr = formatPeriod(clubEntry);

  const accent = accentColor === "blue"
    ? { common: "ring-2 ring-green-400 bg-green-50", badge: "bg-blue-100 text-blue-700" }
    : { common: "ring-2 ring-green-400 bg-green-50", badge: "bg-yellow-100 text-yellow-700" };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer ${isCommon ? accent.common : "bg-white"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 text-sm truncate">{player.name}</span>
            {isCommon && (
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                ⇄ beide
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
            {periodStr && <span>{periodStr}</span>}
            {clubEntry.position && <span className="text-gray-400">{clubEntry.position}</span>}
            {player.nationality && <span className="text-gray-400">{player.nationality}</span>}
          </div>
        </div>
        <div className="text-right shrink-0">
          {duration > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${accent.badge}`}>
              {duration} J.
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function formatPeriod(entry: { startDate?: string; endDate?: string; startYear?: number; endYear?: number }): string {
  const start = entry.startDate ?? (entry.startYear ? String(entry.startYear) : undefined);
  const end = entry.endDate ?? (entry.endYear ? String(entry.endYear) : undefined);
  if (start && end) return `${start} – ${end}`;
  if (start) return `ab ${start}`;
  if (end) return `bis ${end}`;
  return "";
}
