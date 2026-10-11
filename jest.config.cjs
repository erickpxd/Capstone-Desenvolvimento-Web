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
    global: { branches: 65, functions: 70, lines: 85, statements: 75 },
  },
}
