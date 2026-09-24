module.exports = {
  preset: 'ts-jest', testEnvironment: 'node', testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: ['src/app.ts', 'src/logger.ts'],
  coverageThreshold: { global: { lines: 85, statements: 85, functions: 85, branches: 70 } }
};
