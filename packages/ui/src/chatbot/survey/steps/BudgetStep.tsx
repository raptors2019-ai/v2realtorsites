"use client";

interface BudgetStepProps {
  onSelect: (budget: string) => void;
}

export function BudgetStep({ onSelect }: BudgetStepProps) {
  const budgets = [
    { id: "under-500k", label: "Under $500K" },
    { id: "500k-750k", label: "$500K – $750K" },
    { id: "750k-1m", label: "$750K – $1M" },
    { id: "1m-1.5m", label: "$1M – $1.5M" },
    { id: "1.5m-2m", label: "$1.5M – $2M" },
    { id: "over-2m", label: "$2M+" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <p className="text-sm font-medium text-stone-800 mb-1">Investment Range</p>
        <p className="text-xs text-stone-500">Select your comfortable budget</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {budgets.map((budget, index) => (
          <button
            key={budget.id}
            onClick={() => onSelect(budget.id)}
            className="group p-3 bg-white border border-stone-200 rounded-xl transition-all duration-300 hover:border-[#c9a962] hover:shadow-md text-sm font-medium text-stone-700 hover:text-stone-900 animate-in fade-in duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="group-hover:text-[#0a1628]">{budget.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
