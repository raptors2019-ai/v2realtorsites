/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@repo/crm$': '<rootDir>/../crm/src/index.ts',
    '^@repo/types$': '<rootDir>/../types/src/index.ts',
    '^@repo/lib$': '<rootDir>/../lib/src/index.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: false,
    }],
  },
}
