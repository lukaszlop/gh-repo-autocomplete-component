import "@testing-library/jest-dom/vitest";
import {cleanup} from "@testing-library/react";
import {afterAll, afterEach, beforeAll, vi} from "vitest";
import {server} from "./src/__tests__/mocks/server";

// Mock scrollIntoView globally
Element.prototype.scrollIntoView = vi.fn();

// Setup MSW server
beforeAll(() => {
  // Start MSW server for API mocking
  server.listen({
    onUnhandledRequest: "warn",
  });
});

// Reset handlers after each test to prevent test pollution
afterEach(() => {
  server.resetHandlers();
  // Cleanup React Testing Library
  cleanup();
});

// Cleanup MSW server after all tests
afterAll(() => {
  server.close();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof global.IntersectionObserver;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown as typeof global.ResizeObserver;
