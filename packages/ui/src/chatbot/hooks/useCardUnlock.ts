'use client'

import { useState, useCallback } from 'react'

/** Animation duration for card flip in milliseconds */
const FLIP_ANIMATION_DURATION = 400

interface UseCardUnlockOptions {
  /** Whether the card starts locked */
  isLocked?: boolean
  /** Callback when user provides contact info */
  onUnlock?: (contact: { name: string; phone: string; email?: string }) => void
  /** Callback when user skips the unlock form */
  onSkip?: () => void
}

interface UseCardUnlockReturn {
  /** Whether the card content is unlocked */
  unlocked: boolean
  /** Whether the flip animation is in progress */
  isFlipping: boolean
  /** Handle unlock with contact info */
  handleUnlock: (contact: { name: string; phone: string; email?: string }) => void
  /** Handle skip with flip animation */
  handleSkip: () => void
  /** Inline styles for flip animation */
  flipStyles: React.CSSProperties
}

/**
 * Shared hook for card unlock/skip behavior with flip animation.
 * Used by ChatMortgageCard, ChatNeighborhoodCard, and ChatFirstTimeBuyerCard.
 */
export function useCardUnlock({
  isLocked = false,
  onUnlock,
  onSkip,
}: UseCardUnlockOptions): UseCardUnlockReturn {
  const [unlocked, setUnlocked] = useState(!isLocked)
  const [isFlipping, setIsFlipping] = useState(false)

  const handleUnlock = useCallback((contact: { name: string; phone: string; email?: string }) => {
    setUnlocked(true)
    onUnlock?.(contact)
  }, [onUnlock])

  const handleSkip = useCallback(() => {
    setIsFlipping(true)
    onSkip?.()
    setTimeout(() => {
      setUnlocked(true)
      setIsFlipping(false)
    }, FLIP_ANIMATION_DURATION)
  }, [onSkip])

  const flipStyles: React.CSSProperties = {
    transformStyle: 'preserve-3d',
    transform: isFlipping ? 'rotateY(90deg) scale(0.95)' : 'rotateY(0deg) scale(1)',
    opacity: isFlipping ? 0.7 : 1,
  }

  return {
    unlocked,
    isFlipping,
    handleUnlock,
    handleSkip,
    flipStyles,
  }
}
