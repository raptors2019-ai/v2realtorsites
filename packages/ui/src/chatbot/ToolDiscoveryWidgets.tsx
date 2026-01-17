"use client";

import { useMemo } from "react";

// Icons for each tool
const SearchIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MapIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CalculatorIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const HomeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

interface ToolWidget {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
  description?: string;
}

const ALL_TOOLS: ToolWidget[] = [
  {
    id: "property-search",
    label: "Search Properties",
    icon: <SearchIcon />,
    prompt: "Help me search for properties",
    description: "Find homes matching your criteria",
  },
  {
    id: "neighborhood-info",
    label: "Neighborhoods",
    icon: <MapIcon />,
    prompt: "Tell me about neighborhoods in the GTA",
    description: "Explore areas and communities",
  },
  {
    id: "first-time-buyer",
    label: "First-Time Buyer",
    icon: <BookIcon />,
    prompt: "What programs are available for first-time buyers?",
    description: "Rebates, incentives & FAQs",
  },
  {
    id: "mortgage-calculator",
    label: "Mortgage Calculator",
    icon: <CalculatorIcon />,
    prompt: "Help me calculate what I can afford",
    description: "Estimate your budget",
  },
  {
    id: "sell-home",
    label: "Sell My Home",
    icon: <HomeIcon />,
    prompt: "I'm interested in selling my home",
    description: "Get a home evaluation",
  },
  {
    id: "contact-agent",
    label: "Contact Agent",
    icon: <PhoneIcon />,
    prompt: "I'd like to speak with an agent",
    description: "Connect with our team",
  },
];

interface ToolDiscoveryWidgetsProps {
  /** Current tool that was just used - will be excluded from suggestions */
  currentTool?: "mortgage" | "property-search" | "neighborhood" | "first-time-buyer" | "seller";
  /** Callback when a tool widget is clicked */
  onToolSelect: (prompt: string) => void;
  /** Maximum number of widgets to show */
  maxWidgets?: number;
}

export function ToolDiscoveryWidgets({
  currentTool,
  onToolSelect,
  maxWidgets = 4,
}: ToolDiscoveryWidgetsProps) {
  // Filter out the current tool and select relevant suggestions
  const suggestedTools = useMemo(() => {
    const excludeIds: string[] = [];

    // Map current tool to widget IDs to exclude
    switch (currentTool) {
      case "mortgage":
        excludeIds.push("mortgage-calculator");
        break;
      case "property-search":
        excludeIds.push("property-search");
        break;
      case "neighborhood":
        excludeIds.push("neighborhood-info");
        break;
      case "first-time-buyer":
        excludeIds.push("first-time-buyer");
        break;
      case "seller":
        excludeIds.push("sell-home");
        break;
    }

    // Prioritize certain tools based on what was just used
    let priorityOrder: string[] = [];
    switch (currentTool) {
      case "mortgage":
        // After mortgage calc, suggest property search and neighborhoods
        priorityOrder = ["property-search", "neighborhood-info", "first-time-buyer", "contact-agent"];
        break;
      case "property-search":
        // After search, suggest mortgage calc and neighborhoods
        priorityOrder = ["mortgage-calculator", "neighborhood-info", "first-time-buyer", "contact-agent"];
        break;
      case "neighborhood":
        // After neighborhood info, suggest property search and mortgage
        priorityOrder = ["property-search", "mortgage-calculator", "first-time-buyer", "contact-agent"];
        break;
      case "first-time-buyer":
        // After FAQ, suggest mortgage calc and property search
        priorityOrder = ["mortgage-calculator", "property-search", "neighborhood-info", "contact-agent"];
        break;
      default:
        priorityOrder = ["property-search", "mortgage-calculator", "neighborhood-info", "first-time-buyer"];
    }

    // Filter and sort tools
    const filtered = ALL_TOOLS
      .filter(tool => !excludeIds.includes(tool.id))
      .sort((a, b) => {
        const aIndex = priorityOrder.indexOf(a.id);
        const bIndex = priorityOrder.indexOf(b.id);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });

    return filtered.slice(0, maxWidgets);
  }, [currentTool, maxWidgets]);

  return (
    <div className="mt-3">
      <p className="text-xs text-stone-500 mb-2 font-medium">Explore more tools:</p>
      <div className="flex flex-wrap gap-2">
        {suggestedTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool.prompt)}
            className="group flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 hover:bg-gradient-to-r hover:from-[#0a1628] hover:to-[#1a2d4d] border border-stone-200 hover:border-transparent rounded-full text-xs font-medium text-stone-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
            title={tool.description}
          >
            <span className="text-stone-400 group-hover:text-[#c9a962] transition-colors">
              {tool.icon}
            </span>
            {tool.label}
          </button>
        ))}
      </div>
    </div>
  );
}
