"use client";

interface BedroomsStepProps {
  onSelect: (bedrooms: string) => void;
}

export function BedroomsStep({ onSelect }: BedroomsStepProps) {
  const options = [
    { id: "1", label: "1" },
    { id: "2", label: "2" },
    { id: "3", label: "3" },
    { id: "4", label: "4" },
    { id: "5+", label: "5+" },
  ];

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
            onClick={() => onSelect(option.id)}
            className="w-12 h-12 rounded-full border-2 transition-all duration-300 text-sm font-semibold animate-in fade-in duration-300 bg-white border-stone-200 text-stone-700 hover:border-[#c9a962] hover:shadow-md hover:bg-[#0a1628] hover:border-[#0a1628] hover:text-white hover:scale-105"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
