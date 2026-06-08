import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      exclude: ['**/*.d.ts', 'test/**/*', 'dist/**/*'],
      include: ['src/**/*.ts'],
      provider: 'v8',
      reporter: ['text-summary', 'html', 'lcov'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    disableConsoleIntercept: true,
    include: ['test/**/*.test.ts'],
    setupFiles: ['./test/helpers/init.ts'],
    testTimeout: 360_000,
  },
})
