"use client";

import { ChatMortgageCard } from "../ChatMortgageCard";
import type { MortgageEstimate } from "../chatbot-store";

// Tool result types
export type ToolResultType = "mortgageEstimate" | "propertySearch" | "neighborhoodInfo";

export interface ToolResult {
  type: ToolResultType;
  data: unknown;
}

interface ToolResultRendererProps {
  result: ToolResult;
}

/**
 * Routes tool results to their appropriate rendering components.
 * Currently supports: mortgageEstimate
 * Extensible for: propertySearch, neighborhoodInfo
 */
export function ToolResultRenderer({ result }: ToolResultRendererProps) {
  switch (result.type) {
    case "mortgageEstimate":
      return <ChatMortgageCard {...(result.data as MortgageEstimate)} />;

    case "propertySearch":
      // Property search results are typically rendered inline in messages
      // This can be expanded to render property cards if needed
      return null;

    case "neighborhoodInfo":
      // Neighborhood info is typically rendered inline in messages
      // This can be expanded to render a neighborhood card if needed
      return null;

    default:
      return null;
  }
}
