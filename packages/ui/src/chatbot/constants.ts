// Budget display labels
export const BUDGET_LABELS: Record<string, string> = {
  "under-500k": "Under $500K",
  "500k-750k": "$500K – $750K",
  "750k-1m": "$750K – $1M",
  "1m-1.5m": "$1M – $1.5M",
  "1.5m-2m": "$1.5M – $2M",
  "over-2m": "$2M+",
}

// Budget ranges with min/max/avg values for property search
export const BUDGET_RANGES: Record<string, { min: number; max: number; avg: number }> = {
  "under-500k": { min: 0, max: 500000, avg: 400000 },
  "500k-750k": { min: 500000, max: 750000, avg: 625000 },
  "750k-1m": { min: 750000, max: 1000000, avg: 875000 },
  "1m-1.5m": { min: 1000000, max: 1500000, avg: 1250000 },
  "1.5m-2m": { min: 1500000, max: 2000000, avg: 1750000 },
  "over-2m": { min: 2000000, max: 5000000, avg: 2500000 },
}

// Property type labels
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  "detached": "Detached House",
  "semi-detached": "Semi-Detached House",
  "townhouse": "Townhouse",
  "condo": "Condo",
}

// Timeline labels
export const TIMELINE_LABELS: Record<string, string> = {
  "asap": "ASAP",
  "1-3-months": "1-3 months",
  "3-6-months": "3-6 months",
  "just-exploring": "Just exploring",
}

// Timeline mapping for API
export const TIMELINE_API_MAP: Record<string, string> = {
  "asap": "immediate",
  "1-3-months": "1-3-months",
  "3-6-months": "3-6-months",
  "just-exploring": "just-exploring",
}

// Rotating prompts for the chatbot bubble
export const PROMPTS = [
  "How can we help you?",
  "Tell us about your dream home",
  "Ready to start your home search?",
  "Need help with selling?",
  "First-time buyer? We can help!",
]
