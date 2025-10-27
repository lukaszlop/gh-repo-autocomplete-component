# Testing Guide

## Overview

This project uses a comprehensive testing strategy covering unit tests, integration tests, and end-to-end (E2E) tests.

## Tech Stack

### Unit & Integration Testing

- **Vitest** 3.2.4 - Fast unit test runner with ESM support
- **React Testing Library** 16.3.0 - User-centric testing library
- **@testing-library/jest-dom** 6.9.1 - Custom DOM matchers
- **@testing-library/user-event** - User interaction simulation
- **MSW (Mock Service Worker)** 2.11.6 - API mocking on network level
- **@vitest/coverage-v8** 3.2.4 - Code coverage reporting

### E2E Testing

- **Playwright** 1.56.1 - Multi-browser E2E testing (Chromium configured)

## Project Structure

```
gh-repo-autocomplete-component/
├── src/
│   └── __tests__/
│       ├── components/          # Component tests
│       ├── hooks/               # Hook tests
│       ├── lib/                 # Utility tests
│       ├── mocks/
│       │   ├── handlers.ts      # MSW API handlers
│       │   └── server.ts        # MSW server setup
│       └── utils/
│           └── test-utils.tsx   # Test helpers and utilities
├── e2e/
│   ├── page-objects/            # Page Object Models
│   └── *.spec.ts                # E2E test files
├── vitest.config.ts             # Vitest configuration
├── vitest.setup.ts              # Global test setup
└── playwright.config.ts         # Playwright configuration
```

## Running Tests

### Unit Tests

```bash
# Run tests in watch mode (development)
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Watch mode with filtering
npm run test:watch -- useDebounce
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Show test report
npm run test:e2e:report
```

### All Tests

```bash
# Run all tests (unit + E2E)
npm run test:all
```

## Writing Tests

### Unit Tests

#### Component Testing

```typescript
import {describe, it, expect} from "vitest";
import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {renderWithProviders} from "../utils/test-utils";
import {MyComponent} from "@/components/MyComponent";

describe("MyComponent", () => {
  it("should render correctly", () => {
    renderWithProviders(<MyComponent />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("should handle user interaction", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyComponent />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(screen.getByText("Clicked")).toBeInTheDocument();
  });
});
```

#### Hook Testing

```typescript
import {describe, it, expect} from "vitest";
import {renderHook, waitFor} from "@testing-library/react";
import {useMyHook} from "@/hooks/useMyHook";

describe("useMyHook", () => {
  it("should return initial value", () => {
    const {result} = renderHook(() => useMyHook());

    expect(result.current.value).toBe(0);
  });
});
```

#### Mocking API Calls

API calls are automatically mocked using MSW. Define handlers in `src/__tests__/mocks/handlers.ts`:

```typescript
import {http, HttpResponse} from "msw";

export const handlers = [
  http.get("https://api.github.com/search/repositories", () => {
    return HttpResponse.json({
      total_count: 1,
      items: [{id: 1, name: "test-repo"}],
    });
  }),
];
```

### E2E Tests

#### Using Page Objects

```typescript
import {test, expect} from "@playwright/test";
import {GitHubAutocompletePage} from "./page-objects/GitHubAutocompletePage";

test.describe("Feature Name", () => {
  let page: GitHubAutocompletePage;

  test.beforeEach(async ({page: playwrightPage}) => {
    page = new GitHubAutocompletePage(playwrightPage);
    await page.goto();
  });

  test("should do something", async () => {
    await page.search("react");
    await page.waitForResults();

    const count = await page.getResultsCount();
    expect(count).toBeGreaterThan(0);
  });
});
```

#### Element Selection

Always use `data-testid` attributes for resilient selectors:

```tsx
<div data-testid='search-results-list'>{/* content */}</div>
```

```typescript
// In Page Object
this.searchResultsList = page.getByTestId("search-results-list");
```

## Best Practices

### Vitest Guidelines

1. **Mock Factory Functions** - Place mock factories at the top level
2. **Setup Files** - Use `vitest.setup.ts` for global configuration
3. **Inline Snapshots** - Use for readable assertions
4. **Coverage Thresholds** - Maintain meaningful coverage
5. **Watch Mode** - Use during development for instant feedback
6. **Arrange-Act-Assert** - Follow AAA pattern for test structure
7. **Type Safety** - Enable TypeScript checking in tests

### Playwright Guidelines

1. **Page Object Model** - Encapsulate page logic in page objects
2. **data-testid Selectors** - Use resilient test selectors
3. **Isolation** - Use browser contexts for test isolation
4. **Trace Viewer** - Use for debugging test failures
5. **Visual Testing** - Implement screenshot comparisons
6. **Parallel Execution** - Leverage for faster test runs
7. **Arrange-Act-Assert** - Follow AAA pattern for test structure

### Accessibility Testing

```typescript
import {describe, it} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithProviders} from "../utils/test-utils";

describe("Accessibility", () => {
  it("should have proper ARIA attributes", () => {
    renderWithProviders(<MyComponent />);

    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-expanded");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
  });
});
```

## Coverage Requirements

The project maintains the following coverage thresholds:

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

Coverage reports are generated in:

- `coverage/` - Detailed HTML report
- `coverage/lcov.info` - LCOV format for CI/CD

## CI/CD Integration

Tests run automatically on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

See `.github/workflows/test.yml` for the complete workflow.

## Debugging

### Unit Tests

```bash
# Run specific test file
npm run test -- GitHubAutocomplete.test.tsx

# Run tests matching pattern
npm run test -- --grep "search functionality"

# Debug in UI mode
npm run test:ui
```

### E2E Tests

```bash
# Debug mode with Playwright Inspector
npm run test:e2e:debug

# Run specific test file
npx playwright test github-autocomplete.spec.ts

# Run with headed browser
npx playwright test --headed

# View trace
npx playwright show-trace trace.zip
```

## Common Issues

### MSW Not Working

Ensure MSW server is started in `vitest.setup.ts`:

```typescript
beforeAll(() => {
  server.listen({onUnhandledRequest: "warn"});
});
```

### Playwright Tests Failing

1. Install browsers: `npx playwright install chromium`
2. Check dev server is running on `http://localhost:5173`
3. Review screenshots in `test-results/` folder

### Coverage Not Generated

Run with coverage flag:

```bash
npm run test:coverage
```

Check that files aren't excluded in `vitest.config.ts`.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
