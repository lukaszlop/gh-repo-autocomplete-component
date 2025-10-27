import react from "@vitejs/plugin-react";
import path from "path";
import {defineConfig} from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // Use jsdom for DOM testing (React components)
    environment: "jsdom",

    // Global setup file
    setupFiles: ["./vitest.setup.ts"],

    // Enable globals (describe, it, expect) without imports
    globals: true,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.config.{js,ts}",
        "**/*.d.ts",
        "**/types/**",
        "src/main.tsx",
        "src/App.tsx",
        "src/assets/**",
        "**/__tests__/**",
        "**/__mocks__/**",
        "e2e/**",
        "coverage/**",
        "playwright-report/**",
        "test-results/**",
        "**/trace/**",
      ],
      // Coverage thresholds
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },

    // Include/exclude patterns
    include: [
      "**/__tests__/**/*.{test,spec}.{ts,tsx}",
      "**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["node_modules", "dist", "e2e"],

    // Test timeout
    testTimeout: 10000,

    // Hook timeouts
    hookTimeout: 10000,

    // Reporter configuration
    reporters: ["verbose"],

    // Clear mocks between tests
    clearMocks: true,

    // Restore mocks between tests
    restoreMocks: true,

    // Mock reset between tests
    mockReset: true,
  },
});
