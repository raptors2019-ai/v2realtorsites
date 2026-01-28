"use client";

import { useMemo } from "react";
import { cn } from "@repo/lib";

interface PropertyHighlightsProps {
  description: string | undefined;
  className?: string;
}

// Feature keywords with icons and labels
const FEATURE_KEYWORDS = [
  { keywords: ["garage", "car garage", "parking"], icon: "🚗", label: "Garage" },
  { keywords: ["pool", "swimming"], icon: "🏊", label: "Pool" },
  { keywords: ["renovated", "updated", "modern"], icon: "✨", label: "Renovated" },
  { keywords: ["backyard", "yard", "garden"], icon: "🌳", label: "Backyard" },
  { keywords: ["fireplace"], icon: "🔥", label: "Fireplace" },
  { keywords: ["hardwood", "wood floors"], icon: "🪵", label: "Hardwood" },
  { keywords: ["granite", "quartz", "marble"], icon: "💎", label: "Premium Finishes" },
  { keywords: ["stainless", "appliances"], icon: "🍳", label: "Modern Kitchen" },
  { keywords: ["basement", "finished basement"], icon: "🏠", label: "Basement" },
  { keywords: ["ensuite", "en-suite", "master bath"], icon: "🛁", label: "Ensuite" },
  { keywords: ["walk-in", "walk in closet"], icon: "👔", label: "Walk-in Closet" },
  { keywords: ["balcony", "terrace", "deck", "patio"], icon: "🌅", label: "Outdoor Space" },
  { keywords: ["view", "views", "ravine"], icon: "🏞️", label: "Views" },
  { keywords: ["open concept", "open-concept"], icon: "📐", label: "Open Concept" },
  { keywords: ["natural light", "bright", "sun-filled"], icon: "☀️", label: "Bright" },
  { keywords: ["central air", "ac", "air conditioning"], icon: "❄️", label: "A/C" },
  { keywords: ["smart home", "smart thermostat"], icon: "📱", label: "Smart Home" },
  { keywords: ["laundry", "washer", "dryer"], icon: "🧺", label: "In-Unit Laundry" },
  { keywords: ["gym", "fitness"], icon: "💪", label: "Fitness" },
  { keywords: ["concierge", "doorman"], icon: "🛎️", label: "Concierge" },
];

export function PropertyHighlights({
  description,
  className,
}: PropertyHighlightsProps) {
  const highlights = useMemo(() => {
    if (!description) return [];

    const lowerDesc = description.toLowerCase();
    const found: Array<{ icon: string; label: string }> = [];

    for (const feature of FEATURE_KEYWORDS) {
      if (feature.keywords.some((keyword) => lowerDesc.includes(keyword))) {
        found.push({ icon: feature.icon, label: feature.label });
      }
      // Limit to 8 highlights max
      if (found.length >= 8) break;
    }

    return found;
  }, [description]);

  if (highlights.length === 0) return null;

  return (
    <div className={cn("w-full", className)}>
      <h3 className="text-sm font-medium text-text-secondary mb-3">
        Property Highlights
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {highlights.map((highlight, index) => (
          <span
            key={index}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream text-sm text-secondary border border-primary/10"
          >
            <span aria-hidden="true">{highlight.icon}</span>
            <span>{highlight.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
