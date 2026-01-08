"use client";

import { useState } from "react";

interface PropertyTypeStepProps {
  onSelect: (type: string) => void;
}

export function PropertyTypeStep({ onSelect }: PropertyTypeStepProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const types = [
    { id: "detached", label: "Detached", icon: "🏠" },
    { id: "semi-detached", label: "Semi-Detached", icon: "🏘️" },
    { id: "townhouse", label: "Townhouse", icon: "🏡" },
    { id: "condo", label: "Condo", icon: "🏢" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <p className="text-sm font-medium text-stone-800 mb-1">Property Type</p>
        <p className="text-xs text-stone-500">What style of home are you envisioning?</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {types.map((type, index) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            onMouseEnter={() => setHoveredId(type.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="group relative flex flex-col items-center gap-2 p-4 bg-white border border-stone-200 rounded-xl transition-all duration-300 hover:border-[#c9a962] hover:shadow-md animate-in fade-in duration-300"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <span className={`text-2xl transition-transform duration-300 ${hoveredId === type.id ? 'scale-110' : ''}`}>
              {type.icon}
            </span>
            <span className="text-xs font-medium text-stone-700 group-hover:text-stone-900">{type.label}</span>
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-[#c9a962]/5 to-transparent opacity-0 transition-opacity duration-300 ${hoveredId === type.id ? 'opacity-100' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
