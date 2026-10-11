module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFiles: ['<rootDir>/src/test/polyfills.cjs'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  transform: { '^.+\\.[tj]sx?$': 'babel-jest' },
  moduleNameMapper: { '\\.(css|less|scss|sass)$': '<rootDir>/src/test/styleMock.cjs' },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/mocks/**',
    '!src/test/**',
  ],
  coverageThreshold: {
    global: { branches: 25, functions: 20, lines: 35, statements: 30 },
    './src/components/ui/SearchBar.tsx': { lines: 100, statements: 100 },
    './src/components/books/BookCard.tsx': { lines: 100, statements: 100 },
    './src/features/auth/LoginPage.tsx': { lines: 100, statements: 90 },
  },
}
