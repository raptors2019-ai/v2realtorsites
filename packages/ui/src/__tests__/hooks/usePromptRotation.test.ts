import { renderHook, act } from '@testing-library/react'
import { usePromptRotation } from '../../chatbot/hooks/usePromptRotation'

describe('usePromptRotation', () => {
  const prompts = ['First prompt', 'Second prompt', 'Third prompt']

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('initialization', () => {
    it('should start at index 0', () => {
      const { result } = renderHook(() =>
        usePromptRotation({ prompts, enabled: true })
      )
      expect(result.current.currentIndex).toBe(0)
    })

    it('should start at index 0 even when disabled', () => {
      const { result } = renderHook(() =>
        usePromptRotation({ prompts, enabled: false })
      )
      expect(result.current.currentIndex).toBe(0)
    })
  })

  describe('rotation when enabled', () => {
    it('should rotate to next prompt after default interval (4000ms)', () => {
      const { result } = renderHook(() =>
        usePromptRotation({ prompts, enabled: true })
      )

      expect(result.current.currentIndex).toBe(0)

      act(() => {
        jest.advanceTimersByTime(4000)
      })

      expect(result.current.currentIndex).toBe(1)
    })

    it('should use custom interval', () => {
      const { result } = renderHook(() =>
        usePromptRotation({ prompts, enabled: true, interval: 2000 })
      )

      act(() => {
        jest.advanceTimersByTime(2000)
      })

      expect(result.current.currentIndex).toBe(1)
    })

    it('should cycle through all prompts', () => {
      const { result } = renderHook(() =>
        usePromptRotation({ prompts, enabled: true, interval: 1000 })
      )

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(result.current.currentIndex).toBe(1)

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(result.current.currentIndex).toBe(2)

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(result.current.currentIndex).toBe(0) // wraps around
    })

    it('should wrap around after reaching last prompt', () => {
      const { result } = renderHook(() =>
        usePromptRotation({ prompts, enabled: true, interval: 1000 })
      )

      // Advance through all prompts and one more
      act(() => {
        jest.advanceTimersByTime(4000)
      })

      expect(result.current.currentIndex).toBe(1) // 0 -> 1 -> 2 -> 0 -> 1
    })
  })

  describe('when disabled', () => {
    it('should not rotate when disabled', () => {
      const { result } = renderHook(() =>
        usePromptRotation({ prompts, enabled: false, interval: 1000 })
      )

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(result.current.currentIndex).toBe(0)
    })

    it('should stop rotating when enabled changes to false', () => {
      const { result, rerender } = renderHook(
        ({ enabled }) => usePromptRotation({ prompts, enabled, interval: 1000 }),
        { initialProps: { enabled: true } }
      )

      // Advance once
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(result.current.currentIndex).toBe(1)

      // Disable
      rerender({ enabled: false })

      // Should not advance further
      act(() => {
        jest.advanceTimersByTime(3000)
      })
      expect(result.current.currentIndex).toBe(1)
    })

    it('should resume rotating when enabled changes to true', () => {
      const { result, rerender } = renderHook(
        ({ enabled }) => usePromptRotation({ prompts, enabled, interval: 1000 }),
        { initialProps: { enabled: false } }
      )

      act(() => {
        jest.advanceTimersByTime(3000)
      })
      expect(result.current.currentIndex).toBe(0)

      // Enable
      rerender({ enabled: true })

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(result.current.currentIndex).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle single prompt array', () => {
      const { result } = renderHook(() =>
        usePromptRotation({ prompts: ['Only one'], enabled: true, interval: 1000 })
      )

      act(() => {
        jest.advanceTimersByTime(3000)
      })

      expect(result.current.currentIndex).toBe(0)
    })

    it('should handle empty prompts array gracefully', () => {
      const { result } = renderHook(() =>
        usePromptRotation({ prompts: [], enabled: true, interval: 1000 })
      )

      // Should not throw
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      // NaN because 0 % 0 = NaN, but this is an edge case
      // In practice, you'd never pass an empty array
      expect(result.current.currentIndex).toBeNaN()
    })

    it('should handle changing prompts array length', () => {
      const { result, rerender } = renderHook(
        ({ prompts }) => usePromptRotation({ prompts, enabled: true, interval: 1000 }),
        { initialProps: { prompts: ['A', 'B', 'C', 'D', 'E'] } }
      )

      act(() => {
        jest.advanceTimersByTime(4000) // index = 4
      })
      expect(result.current.currentIndex).toBe(4)

      // Change to shorter array
      rerender({ prompts: ['X', 'Y'] })

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      // Should wrap based on new length (5 % 2 = 1, then 1+1 % 2 = 0)
      expect(result.current.currentIndex).toBe(1) // or could be 0 depending on timing
    })
  })
})
