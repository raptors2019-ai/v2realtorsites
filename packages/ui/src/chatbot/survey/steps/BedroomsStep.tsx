"use client";

import { useState } from "react";

interface BedroomsStepProps {
  onSelect: (bedrooms: string) => void;
}

export function BedroomsStep({ onSelect }: BedroomsStepProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    { id: "1", label: "1" },
    { id: "2", label: "2" },
    { id: "3", label: "3" },
    { id: "4", label: "4" },
    { id: "5+", label: "5+" },
  ];

  const handleSelect = (id: string) => {
    setSelected(id);
    setTimeout(() => onSelect(id), 150);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <p className="text-sm font-medium text-stone-800 mb-1">Bedrooms</p>
        <p className="text-xs text-stone-500">How many bedrooms do you need?</p>
      </div>
      <div className="flex gap-2 justify-center">
        {options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={`w-12 h-12 rounded-full border-2 transition-all duration-300 text-sm font-semibold animate-in fade-in duration-300 ${
              selected === option.id
                ? 'bg-[#0a1628] border-[#0a1628] text-white scale-105'
                : 'bg-white border-stone-200 text-stone-700 hover:border-[#c9a962] hover:shadow-md'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
