"use client";

import { useState } from "react";
import { matchCity, type CityMatch } from "@repo/lib";

interface ChatCitySearchProps {
  maxPrice: number;
  onCitySelect: (city: CityMatch, maxPrice: number) => void;
  onSearchAll: (maxPrice: number) => void;
}

/**
 * City search input component for post-mortgage calculation flow
 * Allows user to type a city name or search all GTA
 */
export function ChatCitySearch({ maxPrice, onCitySelect, onSearchAll }: ChatCitySearchProps) {
  const [cityInput, setCityInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<CityMatch | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuggestion(null);

    if (!cityInput.trim()) {
      setError("Please enter a city name");
      return;
    }

    const match = matchCity(cityInput);

    if (match.confidence === 'none') {
      setError("I couldn't find that city in the GTA. Try Toronto, Mississauga, Brampton, etc.");
      return;
    }

    if (match.confidence === 'partial') {
      // Show suggestion for partial matches
      setSuggestion(match);
      return;
    }

    // Exact or alias match - proceed
    onCitySelect(match, maxPrice);
  };

  const handleConfirmSuggestion = () => {
    if (suggestion) {
      onCitySelect(suggestion, maxPrice);
    }
  };

  const handleReject = () => {
    setSuggestion(null);
    setCityInput("");
  };

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Prompt message */}
      <div className="bg-white border border-stone-100 text-stone-700 rounded-2xl rounded-tl-none shadow-sm px-4 py-3">
        <p className="text-sm leading-relaxed">
          Which city would you like to search in?
        </p>
      </div>

      {/* City input form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => {
              setCityInput(e.target.value);
              setError(null);
              setSuggestion(null);
            }}
            placeholder="Type a city (e.g., Mississauga)"
            className="flex-1 px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a962]/50 focus:border-[#c9a962] transition-all"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-gradient-to-r from-[#0a1628] to-[#1a2d4d] text-white text-sm font-medium rounded-xl hover:from-[#1a2d4d] hover:to-[#0a1628] transition-all shadow-sm"
          >
            Search
          </button>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-red-600 px-1">{error}</p>
        )}

        {/* Suggestion confirmation */}
        {suggestion && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-2">
            <p className="text-sm text-amber-800">
              Did you mean <span className="font-semibold">{suggestion.name}</span>?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleConfirmSuggestion}
                className="px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors"
              >
                Yes, search {suggestion.name}
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-3 py-1.5 bg-white border border-amber-300 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-50 transition-colors"
              >
                No, try again
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Search All GTA button */}
      <button
        type="button"
        onClick={() => onSearchAll(maxPrice)}
        className="w-full py-2.5 px-4 bg-white border border-stone-200 text-stone-600 text-sm font-medium rounded-xl hover:bg-stone-50 hover:border-[#c9a962] transition-all"
      >
        Search All GTA
      </button>
    </div>
  );
}
