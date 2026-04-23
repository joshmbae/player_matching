"use client";

import { useState } from "react";
import type { Club, ComparisonResult, FilterOptions } from "@/types";
import { ClubSearch } from "@/components/ClubSearch";
import { PlayerList } from "@/components/PlayerList";
import { CommonPlayersPanel } from "@/components/CommonPlayersPanel";
import { FilterBar } from "@/components/FilterBar";

type Tab = "both" | "clubA" | "clubB" | "common";

export default function HomePage() {
  const [clubA, setClubA] = useState<Club | undefined>();
  const [clubB, setClubB] = useState<Club | undefined>();
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("both");
  const [filters, setFilters] = useState<FilterOptions>({ onlyCommon: false, onlyWithDates: false });

  async function handleCompare() {
    if (!clubA || !clubB) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const url = `/api/compare?clubAId=${clubA.wikidataId ?? clubA.id}&clubBId=${clubB.wikidataId ?? clubB.id}&clubAName=${encodeURIComponent(clubA.name)}&clubBName=${encodeURIComponent(clubB.name)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ComparisonResult = await res.json();
      data.clubA.name = clubA.name;
      data.clubB.name = clubB.name;
      data.playersA.forEach((e) => { e.clubEntry.clubName = clubA.name; });
      data.playersB.forEach((e) => { e.clubEntry.clubName = clubB.name; });
      setResult(data);
      setActiveTab("both");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  const commonIds = new Set(result?.commonPlayers.map((c) => c.player.id) ?? []);

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "both", label: "Beide Vereine" },
    { key: "clubA", label: clubA?.name ?? "Verein A", count: result?.playersA.length },
    { key: "clubB", label: clubB?.name ?? "Verein B", count: result?.playersB.length },
    { key: "common", label: "Gemeinsam", count: result?.commonPlayers.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="text-2xl">&#9917;</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Fußball-Vereinshistorie</h1>
            <p className="text-xs text-gray-500">Spielerhistorien vergleichen &middot; Daten von Wikidata</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Vereine auswählen</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <ClubSearch
              label="Verein A"
              accentColor="blue"
              value={clubA}
              onChange={setClubA}
            />
            <div className="flex items-center justify-center sm:pb-3">
              <div className="text-gray-300 font-bold text-lg">vs</div>
            </div>
            <ClubSearch
              label="Verein B"
              accentColor="yellow"
              value={clubB}
              onChange={setClubB}
            />
            <button
              onClick={handleCompare}
              disabled={!clubA || !clubB || loading}
              className="sm:self-end px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                  Lädt&hellip;
                </span>
              ) : (
                "Vergleichen &rsaquo;"
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">
            <span className="font-semibold">Fehler: </span>{error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Spielerdaten werden geladen&hellip;</p>
              <p className="text-gray-400 text-xs">Dies kann bei großen Vereinen einen Moment dauern.</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <>
            <div className="mb-4">
              <FilterBar
                filters={filters}
                onChange={setFilters}
                hasCommon={result.commonPlayers.length > 0}
              />
            </div>

            {/* Stats Banner */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-center">
                <div className="text-2xl font-bold text-blue-700">{result.playersA.length}</div>
                <div className="text-xs text-blue-500 mt-0.5 truncate">{result.clubA.name}</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-center">
                <div className="text-2xl font-bold text-green-700">{result.commonPlayers.length}</div>
                <div className="text-xs text-green-500 mt-0.5">Gemeinsam</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 text-center">
                <div className="text-2xl font-bold text-yellow-700">{result.playersB.length}</div>
                <div className="text-xs text-yellow-500 mt-0.5 truncate">{result.clubB.name}</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 min-w-max px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-white shadow text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${activeTab === tab.key ? "bg-gray-100 text-gray-600" : "bg-gray-200 text-gray-500"}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "both" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: "75vh" }}>
                  <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm truncate">{result.clubA.name}</h3>
                    <span className="ml-auto text-blue-200 text-xs shrink-0">{result.playersA.length} Spieler</span>
                  </div>
                  <PlayerList
                    entries={result.playersA}
                    commonIds={commonIds}
                    accentColor="blue"
                    filters={filters}
                    clubName={result.clubA.name}
                  />
                </div>
                <div className="bg-white rounded-2xl border border-yellow-100 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: "75vh" }}>
                  <div className="bg-gradient-to-r from-yellow-500 to-amber-400 px-4 py-3 flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm truncate">{result.clubB.name}</h3>
                    <span className="ml-auto text-yellow-100 text-xs shrink-0">{result.playersB.length} Spieler</span>
                  </div>
                  <PlayerList
                    entries={result.playersB}
                    commonIds={commonIds}
                    accentColor="yellow"
                    filters={filters}
                    clubName={result.clubB.name}
                  />
                </div>
              </div>
            )}

            {activeTab === "clubA" && (
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: "75vh" }}>
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex items-center gap-2">
                  <h3 className="text-white font-bold">{result.clubA.name}</h3>
                  <span className="ml-auto text-blue-200 text-sm">{result.playersA.length} Spieler</span>
                </div>
                <PlayerList
                  entries={result.playersA}
                  commonIds={commonIds}
                  accentColor="blue"
                  filters={filters}
                  clubName={result.clubA.name}
                />
              </div>
            )}

            {activeTab === "clubB" && (
              <div className="bg-white rounded-2xl border border-yellow-100 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: "75vh" }}>
                <div className="bg-gradient-to-r from-yellow-500 to-amber-400 px-4 py-3 flex items-center gap-2">
                  <h3 className="text-white font-bold">{result.clubB.name}</h3>
                  <span className="ml-auto text-yellow-100 text-sm">{result.playersB.length} Spieler</span>
                </div>
                <PlayerList
                  entries={result.playersB}
                  commonIds={commonIds}
                  accentColor="yellow"
                  filters={filters}
                  clubName={result.clubB.name}
                />
              </div>
            )}

            {activeTab === "common" && (
              <CommonPlayersPanel
                commonPlayers={result.commonPlayers}
                clubAName={result.clubA.name}
                clubBName={result.clubB.name}
              />
            )}
          </>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">&#9917;</div>
            <p className="text-lg font-medium text-gray-500 mb-1">Vereine auswählen und vergleichen</p>
            <p className="text-sm">Gib zwei Vereinsnamen ein und klicke auf &bdquo;Vergleichen&ldquo;.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["FC Bayern München vs Borussia Dortmund", "Real Madrid vs FC Barcelona", "Arsenal vs Chelsea"].map((example) => (
                <span key={example} className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full">
                  {example}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
        Daten von{" "}
        <a href="https://www.wikidata.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
          Wikidata
        </a>{" "}
        &middot; lizenziert unter CC0
      </footer>
    </div>
  );
}
