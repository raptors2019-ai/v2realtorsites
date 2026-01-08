"use client";

interface TimelineStepProps {
  onSelect: (timeline: string) => void;
}

export function TimelineStep({ onSelect }: TimelineStepProps) {
  const options = [
    { value: "asap", label: "ASAP / As soon as possible", icon: "🔥" },
    { value: "1-3-months", label: "1-3 months", icon: "📅" },
    { value: "3-6-months", label: "3-6 months", icon: "🗓️" },
    { value: "just-exploring", label: "Just exploring", icon: "🔍" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <p className="text-sm font-medium text-stone-800 mb-1">Timeline</p>
        <p className="text-xs text-stone-500">How soon are you looking to purchase?</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option, index) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className="group p-3 bg-white border border-stone-200 rounded-xl transition-all duration-300 hover:border-[#c9a962] hover:shadow-md text-left animate-in fade-in duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-lg mr-2">{option.icon}</span>
            <span className="text-xs font-medium text-stone-700 group-hover:text-stone-900">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
