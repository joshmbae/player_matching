"use client";

import { useState, useEffect, useRef } from "react";
import type { Player } from "@/types";

interface PlayerSearchProps {
  onSelect: (player: Player) => void;
}

export function PlayerSearch({ onSelect }: PlayerSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Player[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(player: Player) {
    setQuery("");
    setSuggestions([]);
    setOpen(false);
    onSelect(player);
  }

  return (
    <div className="relative w-full max-w-xl mx-auto" ref={containerRef}>
      <div className="flex items-center rounded-xl border-2 border-gray-200 bg-white shadow-sm focus-within:border-purple-500 transition-all">
        <span className="pl-4 text-gray-400">&#128269;</span>
        <input
          type="text"
          className="flex-1 px-3 py-3 bg-transparent outline-none text-gray-800 placeholder-gray-400"
          placeholder="Spielername eingeben&hellip;"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
        />
        {loading && (
          <div className="px-3">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin" />
          </div>
        )}
        {query && !loading && (
          <button
            onClick={() => { setQuery(""); setSuggestions([]); }}
            className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            &#10005;
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto">
          {suggestions.map((player) => (
            <li
              key={player.id}
              className="px-4 py-3 cursor-pointer hover:bg-purple-50 border-b last:border-b-0 border-gray-100 transition-colors"
              onMouseDown={() => handleSelect(player)}
            >
              <div className="font-medium text-gray-800">{player.name}</div>
              <div className="text-xs text-gray-500 mt-0.5 flex gap-3 flex-wrap">
                {player.nationality && <span>{player.nationality}</span>}
                {player.birthYear && <span>* {player.birthYear}</span>}
                {player.position && <span>{player.position}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && suggestions.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-3 text-sm text-gray-500">
          Kein Spieler gefunden f&uuml;r &bdquo;{query}&ldquo;
        </div>
      )}
    </div>
  );
}
