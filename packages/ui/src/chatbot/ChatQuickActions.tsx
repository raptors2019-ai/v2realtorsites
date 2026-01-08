"use client";

interface ChatQuickActionsProps {
  onDreamHome: () => void;
  onMortgageCalculator: () => void;
  onExploreNeighborhoods: () => void;
  onContactUs: () => void;
}

export function ChatQuickActions({
  onDreamHome,
  onMortgageCalculator,
  onExploreNeighborhoods,
  onContactUs,
}: ChatQuickActionsProps) {
  return (
    <div className="px-5 pb-4 bg-[#f8f9fa] space-y-2">
      <div className="flex gap-2">
        <button
          onClick={onDreamHome}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold bg-[#1a2332] text-white rounded-lg hover:bg-[#242d3f] transition-all duration-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Find Your Dream Home
        </button>
        <button
          onClick={onMortgageCalculator}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold bg-[#1a2332] text-white rounded-lg hover:bg-[#242d3f] transition-all duration-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Calculate Affordability
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onExploreNeighborhoods}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold bg-[#1a2332] text-white rounded-lg hover:bg-[#242d3f] transition-all duration-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Explore Neighborhoods
        </button>
        <button
          onClick={onContactUs}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold bg-[#1a2332] text-white rounded-lg hover:bg-[#242d3f] transition-all duration-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Contact Agent
        </button>
      </div>
    </div>
  );
}
