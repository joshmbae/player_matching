"use client";

import { useState, useEffect, useRef } from "react";
import type { Club } from "@/types";

interface ClubSearchProps {
  label: string;
  accentColor: "blue" | "yellow";
  value?: Club;
  onChange: (club: Club | undefined) => void;
}

export function ClubSearch({ label, accentColor, value, onChange }: ClubSearchProps) {
  const [query, setQuery] = useState(value?.name ?? "");
  const [suggestions, setSuggestions] = useState<Club[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const accent = accentColor === "blue"
    ? { border: "border-blue-500", bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100 text-blue-800", ring: "focus:ring-blue-500 focus:border-blue-500" }
    : { border: "border-yellow-500", bg: "bg-yellow-50", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-800", ring: "focus:ring-yellow-500 focus:border-yellow-500" };

  useEffect(() => {
    if (value) setQuery(value.name);
  }, [value]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    if (value && query === value.name) return;

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/clubs?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [query, value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectClub(club: Club) {
    setQuery(club.name);
    setSuggestions([]);
    setOpen(false);
    onChange(club);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    if (value) onChange(undefined);
  }

  function handleClear() {
    setQuery("");
    onChange(undefined);
    setSuggestions([]);
  }

  return (
    <div className="flex-1 min-w-0" ref={containerRef}>
      <label className={`block text-sm font-semibold mb-1.5 ${accent.text}`}>{label}</label>
      <div className="relative">
        <div className={`flex items-center rounded-xl border-2 bg-white transition-all ${value ? accent.border : "border-gray-200"} shadow-sm`}>
          <input
            type="text"
            className={`flex-1 px-4 py-3 rounded-xl bg-transparent outline-none text-gray-800 placeholder-gray-400 ${accent.ring} focus:ring-2 focus:ring-offset-0`}
            placeholder={`Vereinsname eingeben…`}
            value={query}
            onChange={handleChange}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
          />
          {loading && (
            <div className="px-3">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            </div>
          )}
          {(value || query) && !loading && (
            <button
              onClick={handleClear}
              className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        {value && (
          <div className={`mt-1.5 flex items-center gap-2 text-xs ${accent.text}`}>
            <span className={`px-2 py-0.5 rounded-full font-medium ${accent.badge}`}>
              ✓ Ausgewählt
            </span>
            {value.country && <span className="text-gray-500">{value.country}</span>}
            {value.founded && <span className="text-gray-400">Gründung: {value.founded}</span>}
          </div>
        )}

        {open && suggestions.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
            {suggestions.map((club) => (
              <li
                key={club.id}
                className={`px-4 py-3 cursor-pointer hover:${accent.bg} border-b last:border-b-0 border-gray-100 transition-colors`}
                onMouseDown={() => selectClub(club)}
              >
                <div className="font-medium text-gray-800">{club.name}</div>
                <div className="text-xs text-gray-500 mt-0.5 flex gap-3">
                  {club.country && <span>{club.country}</span>}
                  {club.founded && <span>Gegr. {club.founded}</span>}
                  <span className="text-gray-300">{club.wikidataId}</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {open && !loading && suggestions.length === 0 && query.length >= 2 && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-3 text-sm text-gray-500">
            Keine Vereine gefunden für „{query}"
          </div>
        )}
      </div>
    </div>
  );
}
