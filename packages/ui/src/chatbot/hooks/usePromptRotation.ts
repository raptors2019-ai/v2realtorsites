'use client'

import { useState, useEffect } from 'react'

interface UsePromptRotationOptions {
  prompts: string[]
  interval?: number
  enabled: boolean
}

interface UsePromptRotationReturn {
  currentIndex: number
}

export function usePromptRotation({
  prompts,
  interval = 4000,
  enabled,
}: UsePromptRotationOptions): UsePromptRotationReturn {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!enabled) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % prompts.length)
    }, interval)

    return () => clearInterval(timer)
  }, [enabled, prompts.length, interval])

  return { currentIndex }
}
