/**
 * Shared lead quality scoring utility
 * Consolidates scoring logic used across chatbot tools
 */

export type LeadQuality = 'hot' | 'warm' | 'cold'

export interface LeadScoringParams {
  // Contact info
  cellPhone?: string
  email?: string

  // Timeline indicators
  timeline?: string
  sellerTimeline?: string

  // Qualification signals
  preApproved?: boolean
  firstTimeBuyer?: boolean
  mortgageEstimate?: { maxPrice: number }

  // Urgency factors
  urgencyFactors?: string[]
}

/**
 * Calculate lead quality score based on engagement signals
 *
 * Scoring breakdown:
 * - Phone number provided: +3 (high intent)
 * - Pre-approved: +3 (ready to buy)
 * - Timeline urgency:
 *   - immediate/asap: +3
 *   - 1-3-months/3-months: +2
 *   - 3-6-months/6-months: +1
 *   - just-browsing/exploring: 0
 * - Urgency factors: +1 per factor (max 2)
 * - First-time buyer: +1
 * - Mortgage estimate completed: +1
 *
 * Thresholds:
 * - Hot: score >= 5
 * - Warm: score >= 2
 * - Cold: score < 2
 */
export function calculateLeadQuality(params: LeadScoringParams): LeadQuality {
  let score = 0

  // Phone number provided (+3 - high intent)
  if (params.cellPhone) score += 3

  // Pre-approved (+3 - ready to buy)
  if (params.preApproved) score += 3

  // Timeline urgency
  const timeline = params.timeline || params.sellerTimeline
  if (timeline) {
    const normalizedTimeline = timeline.toLowerCase()
    if (normalizedTimeline === 'asap' || normalizedTimeline === 'immediate') {
      score += 3
    } else if (
      normalizedTimeline === '1-3-months' ||
      normalizedTimeline === '3-months' ||
      normalizedTimeline === '3months'
    ) {
      score += 2
    } else if (
      normalizedTimeline === '3-6-months' ||
      normalizedTimeline === '6-months' ||
      normalizedTimeline === '6months'
    ) {
      score += 1
    }
    // just-browsing, just-exploring, 6+ months = 0
  }

  // Urgency factors (relocating, lease ending, etc.)
  if (params.urgencyFactors && params.urgencyFactors.length > 0) {
    score += Math.min(params.urgencyFactors.length, 2)
  }

  // First-time buyer (+1 - motivated but may need more time)
  if (params.firstTimeBuyer) score += 1

  // Mortgage estimate completed (+1 - engaged)
  if (params.mortgageEstimate) score += 1

  // Score thresholds
  if (score >= 5) return 'hot'
  if (score >= 2) return 'warm'
  return 'cold'
}

/**
 * Simple lead quality based on timeline only
 * Used when limited info is available (e.g., capture-preferences)
 */
export function determineLeadQualityFromTimeline(
  timeline?: string,
  urgencyFactors?: string[],
  preApproved?: boolean
): LeadQuality {
  // Hot: Has immediate timeline or urgency factors
  if (timeline === 'immediate' || timeline === '3-months' || timeline === 'asap') {
    return 'hot'
  }
  if (urgencyFactors && urgencyFactors.length > 0) {
    return 'hot'
  }
  if (preApproved) {
    return 'warm'
  }
  if (timeline === 'just-browsing' || timeline === 'just-exploring') {
    return 'cold'
  }
  return 'warm'
}
