import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Create QueryClient with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 2 minutes (considered fresh)
      staleTime: 120000, // 2 minutes in milliseconds
      // Keep unused data in cache for 5 minutes before garbage collection
      gcTime: 300000, // 5 minutes in milliseconds
      // Retry configuration with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on abort errors (user cancelled)
        if (error instanceof Error && error.name === "AbortError") {
          return false;
        }

        // Don't retry on rate limit errors (429) or client errors (4xx)
        if (
          error instanceof Error &&
          (error.message.includes("429") ||
            (error.message.includes("GitHub API error") &&
              error.message.match(/4\d{2}/)))
        ) {
          return false;
        }

        // Retry up to 3 times for network and server errors
        return failureCount < 3;
      },
      // Exponential backoff: 1s, 2s, 4s
      retryDelay: (attemptIndex) => {
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },
    },
  },
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
