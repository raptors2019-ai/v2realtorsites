import { renderHook, act } from '@testing-library/react'
import { useCarousel } from '../../hooks/useCarousel'

describe('useCarousel', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('initialization', () => {
    it('should start at page 0', () => {
      const { result } = renderHook(() =>
        useCarousel({ totalPages: 3 })
      )
      expect(result.current.currentPage).toBe(0)
    })

    it('should not be paused initially', () => {
      const { result } = renderHook(() =>
        useCarousel({ totalPages: 3 })
      )
      expect(result.current.isPaused).toBe(false)
    })
  })

  describe('navigation', () => {
    it('should go to specific page with goToPage', () => {
      const { result } = renderHook(() =>
        useCarousel({ totalPages: 5 })
      )

      act(() => {
        result.current.goToPage(3)
      })

      expect(result.current.currentPage).toBe(3)
    })

    it('should advance to next page with nextPage', () => {
      const { result } = renderHook(() =>
        useCarousel({ totalPages: 3 })
      )

      act(() => {
        result.current.nextPage()
      })

      expect(result.current.currentPage).toBe(1)
    })

    it('should wrap around to 0 when nextPage exceeds total', () => {
      const { result } = renderHook(() =>
        useCarousel({ totalPages: 3 })
      )

      act(() => {
        result.current.goToPage(2)
        result.current.nextPage()
      })

      expect(result.current.currentPage).toBe(0)
    })

    it('should go to previous page with prevPage', () => {
      const { result } = renderHook(() =>
        useCarousel({ totalPages: 3 })
      )

      act(() => {
        result.current.goToPage(2)
        result.current.prevPage()
      })

      expect(result.current.currentPage).toBe(1)
    })

    it('should wrap around to last page when prevPage from 0', () => {
      const { result } = renderHook(() =>
        useCarousel({ totalPages: 3 })
      )

      act(() => {
        result.current.prevPage()
      })

      expect(result.current.currentPage).toBe(2)
    })
  })

  describe('pause and resume', () => {
    it('should set isPaused to true when pause is called', () => {
      const { result } = renderHook(() =>
        useCarousel({ totalPages: 3 })
      )

      act(() => {
        result.current.pause()
      })

      expect(result.current.isPaused).toBe(true)
    })

    it('should set isPaused to false when resume is called', () => {
      const { result } = renderHook(() =>
        useCarousel({ totalPages: 3 })
      )

      act(() => {
        result.current.pause()
        result.current.resume()
      })

      expect(result.current.isPaused).toBe(false)
    })
  })

  describe('auto-advance', () => {
    it('should auto-advance after interval', () => {
      const { result } = renderHook(() =>
        useCarousel({ totalPages: 3, autoAdvanceInterval: 5000 })
      )

      expect(result.current.currentPage).toBe(0)

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(result.current.currentPage).toBe(1)
    })

    it('should continue auto-advancing through pages', () => {
      const { result } = renderHook(() =>
        useCarousel({ totalPages: 3, autoAdvanceInterval: 1000 })
      )

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(result.current.currentPage).toBe(1)

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(result.current.currentPage).toBe(2)

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(result.current.currentPage).toBe(0)
    })

    it('should not auto-advance when paused', () => {
      const { result } = renderHook(() =>
        useCarousel({ totalPages: 3, autoAdvanceInterval: 1000 })
      )

      act(() => {
        result.current.pause()
      })

      act(() => {
        jest.advanceTimersByTime(3000)
      })

      expect(result.current.currentPage).toBe(0)
    })

    it('should resume auto-advancing after resume', () => {
      const { result } = renderHook(() =>
        useCarousel({ totalPages: 3, autoAdvanceInterval: 1000 })
      )

      // Pause first
      act(() => {
        result.current.pause()
      })

      // Then advance time - should not advance while paused
      act(() => {
        jest.advanceTimersByTime(2000)
      })
      expect(result.current.currentPage).toBe(0)

      // Resume and wait for next interval
      act(() => {
        result.current.resume()
      })

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(result.current.currentPage).toBe(1)
    })

    it('should not auto-advance when enabled is false', () => {
      const { result } = renderHook(() =>
        useCarousel({ totalPages: 3, autoAdvanceInterval: 1000, enabled: false })
      )

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(result.current.currentPage).toBe(0)
    })

    it('should not auto-advance when interval is 0', () => {
      const { result } = renderHook(() =>
        useCarousel({ totalPages: 3, autoAdvanceInterval: 0 })
      )

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(result.current.currentPage).toBe(0)
    })

    it('should use default interval of 5000ms', () => {
      const { result } = renderHook(() =>
        useCarousel({ totalPages: 3 })
      )

      act(() => {
        jest.advanceTimersByTime(4999)
      })
      expect(result.current.currentPage).toBe(0)

      act(() => {
        jest.advanceTimersByTime(1)
      })
      expect(result.current.currentPage).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle single page carousel', () => {
      const { result } = renderHook(() =>
        useCarousel({ totalPages: 1, autoAdvanceInterval: 1000 })
      )

      act(() => {
        jest.advanceTimersByTime(3000)
      })

      expect(result.current.currentPage).toBe(0)
    })

    it('should handle changing totalPages', () => {
      const { result, rerender } = renderHook(
        ({ totalPages }) => useCarousel({ totalPages, autoAdvanceInterval: 1000 }),
        { initialProps: { totalPages: 5 } }
      )

      act(() => {
        result.current.goToPage(4)
      })
      expect(result.current.currentPage).toBe(4)

      rerender({ totalPages: 3 })

      act(() => {
        result.current.nextPage()
      })
      // Should wrap around based on new totalPages
      expect(result.current.currentPage).toBe(2)
    })
  })
})
