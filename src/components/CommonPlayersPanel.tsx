"use client";

import { useState } from "react";
import type { CommonPlayer, Player } from "@/types";
import { PlayerModal } from "./PlayerModal";

interface CommonPlayersPanelProps {
  commonPlayers: CommonPlayer[];
  clubAName: string;
  clubBName: string;
}

export function CommonPlayersPanel({ commonPlayers, clubAName, clubBName }: CommonPlayersPanelProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const sorted = [...commonPlayers].sort((a, b) =>
    a.player.name.localeCompare(b.player.name, "de")
  );

  return (
    <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200">
        <h2 className="text-lg font-bold text-green-800 flex items-center gap-2">
          <span className="text-green-600">⇄</span>
          Gemeinsame Spieler
          <span className="ml-auto bg-green-200 text-green-800 text-sm font-semibold px-2.5 py-0.5 rounded-full">
            {sorted.length}
          </span>
        </h2>
        <p className="text-sm text-green-600 mt-0.5">
          Spieler, die für beide Vereine aktiv waren
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <div className="text-3xl mb-2">🔍</div>
          <div className="text-sm">Keine gemeinsamen Spieler gefunden.</div>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {sorted.map((common, i) => {
            const startA = common.entryA.startDate ?? (common.entryA.startYear ? String(common.entryA.startYear) : "?");
            const endA = common.entryA.endDate ?? (common.entryA.endYear ? String(common.entryA.endYear) : "?");
            const startB = common.entryB.startDate ?? (common.entryB.startYear ? String(common.entryB.startYear) : "?");
            const endB = common.entryB.endDate ?? (common.entryB.endYear ? String(common.entryB.endYear) : "?");

            return (
              <button
                key={`${common.player.id}-${i}`}
                onClick={() => setSelectedPlayer(common.player)}
                className="w-full text-left px-6 py-3 hover:bg-green-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{common.player.name}</div>
                    <div className="text-xs text-gray-500 mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
                      <span>
                        <span className="text-blue-600 font-medium">{clubAName}</span>
                        {" "}
                        {startA} – {endA}
                      </span>
                      <span>
                        <span className="text-yellow-600 font-medium">{clubBName}</span>
                        {" "}
                        {startB} – {endB}
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-300 text-sm">›</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedPlayer && (
        <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
}
