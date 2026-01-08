"use client";

import { useState } from "react";

interface LocationStepProps {
  onSelect: (locations: string[]) => void;
}

export function LocationStep({ onSelect }: LocationStepProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const locations = [
    "Toronto", "Mississauga", "Brampton", "Vaughan",
    "Markham", "Richmond Hill", "Milton", "Oakville",
    "Burlington", "Hamilton", "Caledon"
  ];

  const toggleLocation = (loc: string) => {
    setSelected(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <p className="text-sm font-medium text-stone-800 mb-1">Preferred Locations</p>
        <p className="text-xs text-stone-500">Select all areas you&apos;re interested in</p>
      </div>
      <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-stone-100 [&::-webkit-scrollbar-thumb]:bg-[#0a1628] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#1a2d4d]">
        {locations.map((loc, index) => (
          <button
            key={loc}
            onClick={() => toggleLocation(loc)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 animate-in fade-in duration-300 ${
              selected.includes(loc)
                ? "bg-[#0a1628] text-white shadow-md"
                : "bg-white border border-stone-200 text-stone-600 hover:border-[#c9a962] hover:text-stone-800"
            }`}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {loc}
          </button>
        ))}
      </div>
      <button
        onClick={() => selected.length > 0 && onSelect(selected)}
        disabled={selected.length === 0}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
          selected.length > 0
            ? "bg-gradient-to-r from-[#c9a962] to-[#b8944d] text-white shadow-md hover:shadow-lg hover:scale-[1.02]"
            : "bg-stone-100 text-stone-400 cursor-not-allowed"
        }`}
      >
        {selected.length > 0 ? `Continue with ${selected.length} location${selected.length > 1 ? 's' : ''}` : 'Select at least one location'}
      </button>
    </div>
  );
}
