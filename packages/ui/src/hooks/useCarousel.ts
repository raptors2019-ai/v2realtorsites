'use client'

import { useState, useCallback, useEffect } from 'react'

export interface UseCarouselOptions {
  totalPages: number
  autoAdvanceInterval?: number
  enabled?: boolean
}

export interface UseCarouselReturn {
  currentPage: number
  isPaused: boolean
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  pause: () => void
  resume: () => void
}

export function useCarousel({
  totalPages,
  autoAdvanceInterval = 5000,
  enabled = true,
}: UseCarouselOptions): UseCarouselReturn {
  const [currentPage, setCurrentPage] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }, [totalPages])

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }, [totalPages])

  const pause = useCallback(() => setIsPaused(true), [])
  const resume = useCallback(() => setIsPaused(false), [])

  useEffect(() => {
    if (!enabled || isPaused || autoAdvanceInterval <= 0) return

    const timer = setInterval(nextPage, autoAdvanceInterval)
    return () => clearInterval(timer)
  }, [enabled, isPaused, autoAdvanceInterval, nextPage])

  return {
    currentPage,
    isPaused,
    goToPage,
    nextPage,
    prevPage,
    pause,
    resume,
  }
}
