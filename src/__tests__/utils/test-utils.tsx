import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {render, RenderOptions} from "@testing-library/react";
import {ReactElement, ReactNode} from "react";

/**
 * Create a fresh QueryClient instance for each test
 * This prevents test pollution from cached queries
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
        gcTime: 0, // Disable cache garbage collection
        staleTime: 0, // Always fetch fresh data
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Suppress error logs in tests
    },
  });
}

interface AllTheProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

/**
 * Wrapper component with all necessary providers
 */
export function AllTheProviders({children, queryClient}: AllTheProvidersProps) {
  const client = queryClient ?? createTestQueryClient();

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
}

/**
 * Custom render function that includes all providers
 * Use this instead of @testing-library/react's render
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const {queryClient, ...renderOptions} = options ?? {};

  return render(ui, {
    wrapper: ({children}) => (
      <AllTheProviders queryClient={queryClient}>{children}</AllTheProviders>
    ),
    ...renderOptions,
  });
}

/**
 * Wait for a condition to be true
 * Useful for testing async behavior
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000
): Promise<void> {
  const startTime = Date.now();

  while (!(await condition())) {
    if (Date.now() - startTime > timeout) {
      throw new Error("Timeout waiting for condition");
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

/**
 * Create a mock GitHub repository for testing
 */
export function createMockRepository(overrides = {}) {
  return {
    id: 1,
    name: "test-repo",
    full_name: "test-owner/test-repo",
    owner: {
      login: "test-owner",
      avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
    },
    description: "Test repository description",
    html_url: "https://github.com/test-owner/test-repo",
    stargazers_count: 100,
    language: "TypeScript",
    updated_at: "2024-10-27T10:00:00Z",
    ...overrides,
  };
}

/**
 * Create a mock GitHub user for testing
 */
export function createMockUser(overrides = {}) {
  return {
    login: "test-user",
    id: 1,
    avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
    html_url: "https://github.com/test-user",
    name: "Test User",
    bio: "Test user bio",
    ...overrides,
  };
}

// Re-export everything from React Testing Library
export * from "@testing-library/react";
export {userEvent} from "@testing-library/user-event";
