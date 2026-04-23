"use client";

import type { FilterOptions } from "@/types";

interface FilterBarProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  hasCommon: boolean;
}

export function FilterBar({ filters, onChange, hasCommon }: FilterBarProps) {
  function update(patch: Partial<FilterOptions>) {
    onChange({ ...filters, ...patch });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-4">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0">Filter</span>

      {hasCommon && (
        <label className="flex items-center gap-2 cursor-pointer group">
          <div
            onClick={() => update({ onlyCommon: !filters.onlyCommon })}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${filters.onlyCommon ? "bg-green-500" : "bg-gray-200"}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.onlyCommon ? "translate-x-4" : ""}`} />
          </div>
          <span className="text-sm text-gray-700">Nur gemeinsame Spieler</span>
        </label>
      )}

      <label className="flex items-center gap-2 cursor-pointer">
        <div
          onClick={() => update({ onlyWithDates: !filters.onlyWithDates })}
          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${filters.onlyWithDates ? "bg-blue-500" : "bg-gray-200"}`}
        >
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.onlyWithDates ? "translate-x-4" : ""}`} />
        </div>
        <span className="text-sm text-gray-700">Nur mit Datumsangaben</span>
      </label>

      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span className="text-gray-500">Zeitraum:</span>
        <input
          type="number"
          placeholder="von"
          min={1800}
          max={2030}
          value={filters.startYearMin ?? ""}
          onChange={(e) => update({ startYearMin: e.target.value ? Number(e.target.value) : undefined })}
          className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
        />
        <span className="text-gray-400">–</span>
        <input
          type="number"
          placeholder="bis"
          min={1800}
          max={2030}
          value={filters.startYearMax ?? ""}
          onChange={(e) => update({ startYearMax: e.target.value ? Number(e.target.value) : undefined })}
          className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
        />
      </div>

      {(filters.onlyCommon || filters.onlyWithDates || filters.startYearMin || filters.startYearMax) && (
        <button
          onClick={() => onChange({ onlyCommon: false, onlyWithDates: false })}
          className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
        >
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
}
