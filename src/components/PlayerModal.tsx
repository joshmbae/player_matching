"use client";

import { useEffect, useState } from "react";
import type { Player, CareerEntry } from "@/types";
import { getDurationYears } from "@/lib/comparison";

interface PlayerModalProps {
  player: Player;
  onClose: () => void;
}

export function PlayerModal({ player, onClose }: PlayerModalProps) {
  const [fullCareer, setFullCareer] = useState<CareerEntry[]>(player.careerEntries);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!player.wikidataId || player.careerEntries.length > 0) return;
    setLoading(true);
    fetch(`/api/players?playerId=${player.wikidataId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setFullCareer(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [player]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sorted = [...fullCareer].sort((a, b) => (a.startYear ?? 9999) - (b.startYear ?? 9999));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{player.name}</h2>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
              {player.nationality && <span>{player.nationality}</span>}
              {player.birthDate && <span>* {player.birthDate}</span>}
              {player.position && <span>{player.position}</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-4 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Karriere-Timeline
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : sorted.length === 0 ? (
            <p className="text-gray-500 text-sm">Keine Karrieredaten verfügbar.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {sorted.map((entry, i) => {
                  const duration = getDurationYears(entry);
                  const start = entry.startDate ?? (entry.startYear ? String(entry.startYear) : "?");
                  const end = entry.endDate ?? (entry.endYear ? String(entry.endYear) : "heute");
                  return (
                    <div key={i} className="relative pl-8">
                      <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-blue-400 bg-white" />
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="font-medium text-gray-800 text-sm">{entry.clubName}</div>
                        <div className="text-xs text-gray-500 mt-0.5 flex gap-2 flex-wrap">
                          <span>{start} – {end}</span>
                          {duration > 0 && <span className="text-gray-400">({duration} Jahre)</span>}
                          {entry.position && <span>{entry.position}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {player.wikidataId && (
            <a
              href={`https://www.wikidata.org/wiki/${player.wikidataId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              Wikidata-Eintrag öffnen ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
