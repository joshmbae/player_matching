"use client";

import { useEffect, useState } from "react";
import type { Player } from "@/types";
import { getDurationYears } from "@/lib/comparison";

interface PlayerCareerViewProps {
  player: Player;
  onClose: () => void;
}

export function PlayerCareerView({ player: initialPlayer, onClose }: PlayerCareerViewProps) {
  const [player, setPlayer] = useState<Player>(initialPlayer);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialPlayer.wikidataId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/players/career?playerId=${initialPlayer.wikidataId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Player) => setPlayer(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [initialPlayer.wikidataId]);

  const sorted = [...player.careerEntries].sort(
    (a, b) => (a.startYear ?? 9999) - (b.startYear ?? 9999)
  );

  const totalYears = sorted.reduce((sum, e) => sum + getDurationYears(e), 0);
  const clubs = new Set(sorted.map((e) => e.clubId)).size;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{player.name}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-purple-200">
              {player.nationality && <span>{player.nationality}</span>}
              {player.birthDate && <span>* {player.birthDate}</span>}
              {player.position && <span>{player.position}</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-200 hover:text-white transition-colors text-xl leading-none ml-4"
          >
            &#10005;
          </button>
        </div>

        {!loading && sorted.length > 0 && (
          <div className="flex gap-4 mt-4">
            <div className="bg-purple-700/50 rounded-lg px-3 py-2 text-center">
              <div className="text-lg font-bold text-white">{clubs}</div>
              <div className="text-xs text-purple-300">Vereine</div>
            </div>
            <div className="bg-purple-700/50 rounded-lg px-3 py-2 text-center">
              <div className="text-lg font-bold text-white">{sorted.length}</div>
              <div className="text-xs text-purple-300">Stationen</div>
            </div>
            {totalYears > 0 && (
              <div className="bg-purple-700/50 rounded-lg px-3 py-2 text-center">
                <div className="text-lg font-bold text-white">{totalYears}</div>
                <div className="text-xs text-purple-300">Jahre gesamt</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-purple-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Karrieredaten werden geladen&hellip;</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
            Fehler beim Laden: {error}
          </div>
        )}

        {!loading && !error && sorted.length === 0 && (
          <div className="py-10 text-center text-gray-400">
            <div className="text-3xl mb-2">&#128269;</div>
            <p className="text-sm">Keine Karrieredaten in Wikidata gefunden.</p>
          </div>
        )}

        {!loading && sorted.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">
              Karriere-Timeline
            </h3>
            <div className="relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />
              <div className="space-y-3">
                {sorted.map((entry, i) => {
                  const duration = getDurationYears(entry);
                  const start = entry.startDate ?? (entry.startYear ? String(entry.startYear) : null);
                  const end = entry.endDate ?? (entry.endYear ? String(entry.endYear) : null);
                  const isLast = i === sorted.length - 1 && !entry.endYear;

                  return (
                    <div key={`${entry.clubId}-${i}`} className="relative pl-10">
                      <div className={`absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 ${isLast ? "border-purple-500 bg-purple-100" : "border-gray-400 bg-white"}`} />
                      <div className={`rounded-xl p-3.5 border ${isLast ? "border-purple-200 bg-purple-50" : "border-gray-100 bg-gray-50"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm">{entry.clubName}</div>
                            <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-2">
                              {start && end ? (
                                <span>{start} &ndash; {end}</span>
                              ) : start ? (
                                <span>ab {start}</span>
                              ) : end ? (
                                <span>bis {end}</span>
                              ) : (
                                <span className="text-gray-400">Zeitraum unbekannt</span>
                              )}
                              {entry.position && <span className="text-gray-400">{entry.position}</span>}
                            </div>
                          </div>
                          <div className="shrink-0 flex flex-col items-end gap-1">
                            {duration > 0 && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isLast ? "bg-purple-100 text-purple-700" : "bg-gray-200 text-gray-600"}`}>
                                {duration} J.
                              </span>
                            )}
                            {isLast && (
                              <span className="text-xs text-purple-500 font-medium">aktuell</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {player.wikidataId && (
              <a
                href={`https://www.wikidata.org/wiki/${player.wikidataId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 transition-colors"
              >
                Wikidata-Eintrag &#8599;
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}
