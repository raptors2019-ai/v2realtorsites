"use client";

import { useMemo } from "react";
import { cn } from "@repo/lib";
import {
  Car,
  Waves,
  Sparkles,
  TreeDeciduous,
  Flame,
  PanelTop,
  Gem,
  ChefHat,
  Home,
  Bath,
  ShirtIcon,
  Sun,
  Mountain,
  Maximize2,
  Lightbulb,
  Snowflake,
  Smartphone,
  WashingMachine,
  Dumbbell,
  Bell,
  type LucideIcon,
} from "lucide-react";

interface PropertyHighlightsProps {
  description: string | undefined;
  className?: string;
}

// Feature keywords with Lucide icons and labels
const FEATURE_KEYWORDS: Array<{
  keywords: string[];
  icon: LucideIcon;
  label: string;
}> = [
  { keywords: ["garage", "car garage", "parking"], icon: Car, label: "Garage" },
  { keywords: ["pool", "swimming"], icon: Waves, label: "Pool" },
  { keywords: ["renovated", "updated", "modern"], icon: Sparkles, label: "Renovated" },
  { keywords: ["backyard", "yard", "garden"], icon: TreeDeciduous, label: "Backyard" },
  { keywords: ["fireplace"], icon: Flame, label: "Fireplace" },
  { keywords: ["hardwood", "wood floors"], icon: PanelTop, label: "Hardwood" },
  { keywords: ["granite", "quartz", "marble"], icon: Gem, label: "Premium Finishes" },
  { keywords: ["stainless", "appliances", "kitchen"], icon: ChefHat, label: "Modern Kitchen" },
  { keywords: ["basement", "finished basement"], icon: Home, label: "Basement" },
  { keywords: ["ensuite", "en-suite", "master bath"], icon: Bath, label: "Ensuite" },
  { keywords: ["walk-in", "walk in closet"], icon: ShirtIcon, label: "Walk-in Closet" },
  { keywords: ["balcony", "terrace", "deck", "patio"], icon: Sun, label: "Outdoor Space" },
  { keywords: ["view", "views", "ravine"], icon: Mountain, label: "Views" },
  { keywords: ["open concept", "open-concept"], icon: Maximize2, label: "Open Concept" },
  { keywords: ["natural light", "bright", "sun-filled"], icon: Lightbulb, label: "Bright" },
  { keywords: ["central air", "ac", "air conditioning"], icon: Snowflake, label: "A/C" },
  { keywords: ["smart home", "smart thermostat"], icon: Smartphone, label: "Smart Home" },
  { keywords: ["laundry", "washer", "dryer"], icon: WashingMachine, label: "In-Unit Laundry" },
  { keywords: ["gym", "fitness"], icon: Dumbbell, label: "Fitness" },
  { keywords: ["concierge", "doorman"], icon: Bell, label: "Concierge" },
];

export function PropertyHighlights({
  description,
  className,
}: PropertyHighlightsProps) {
  const highlights = useMemo(() => {
    if (!description) return [];

    const lowerDesc = description.toLowerCase();
    const found: Array<{ Icon: LucideIcon; label: string }> = [];

    for (const feature of FEATURE_KEYWORDS) {
      if (feature.keywords.some((keyword) => lowerDesc.includes(keyword))) {
        found.push({ Icon: feature.icon, label: feature.label });
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
            <highlight.Icon className="w-4 h-4 text-primary" aria-hidden="true" />
            <span>{highlight.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
