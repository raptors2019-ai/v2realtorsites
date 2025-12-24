// Mock window.gtag for testing analytics
declare global {
  interface Window {
    gtag: jest.Mock
  }
}

// Reset gtag mock before each test
beforeEach(() => {
  // Create a mock gtag function
  window.gtag = jest.fn()
})

afterEach(() => {
  jest.clearAllMocks()
})

export {}
