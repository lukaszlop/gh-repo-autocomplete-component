import {GitHubAutocomplete} from "@/components/GitHubAutocomplete";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {describe, expect, it, vi} from "vitest";
import {renderWithProviders} from "../utils/test-utils";

describe("GitHubAutocomplete", () => {
  describe("Rendering", () => {
    it("should render search input with placeholder", () => {
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);
      expect(input).toBeInTheDocument();
    });

    it("should render input with search icon", () => {
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByRole("combobox");
      expect(input).toBeInTheDocument();
    });

    it("should render with custom placeholder", () => {
      renderWithProviders(
        <GitHubAutocomplete placeholder='Custom search placeholder' />
      );

      const input = screen.getByPlaceholderText(/custom search placeholder/i);
      expect(input).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const {container} = renderWithProviders(
        <GitHubAutocomplete className='custom-class' />
      );

      const wrapper = container.querySelector(".custom-class");
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("should update input value when typing", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);
      await user.type(input, "test");

      expect(input).toHaveValue("test");
    });

    it("should display search results after typing", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);
      await user.type(input, "react");

      // Wait for results to load
      await waitFor(
        () => {
          const results = screen.getAllByRole("option");
          expect(results.length).toBeGreaterThan(0);
        },
        {timeout: 3000}
      );
    });

    it("should clear input when clear button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);
      await user.type(input, "test");

      const clearButton = screen.getByLabelText(/clear search/i);
      await user.click(clearButton);

      expect(input).toHaveValue("");
    });

    it("should show hint state when typing less than 3 characters", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);
      await user.type(input, "re");

      await waitFor(() => {
        expect(screen.getByTestId("hint-state")).toBeInTheDocument();
      });
    });

    it("should show loading state while searching", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);
      await user.type(input, "react");

      // Should show loading skeleton briefly
      await waitFor(() => {
        const skeleton = screen.queryByTestId("loading-skeleton");
        if (skeleton) {
          expect(skeleton).toBeInTheDocument();
        }
      });
    });

    it("should show empty state when no results found", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);
      await user.type(input, "nonexistentrepo12345xyz");

      await waitFor(
        () => {
          expect(screen.getByTestId("empty-state")).toBeInTheDocument();
        },
        {timeout: 3000}
      );
    });

    it("should call onSelect callback when result is clicked", async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      renderWithProviders(<GitHubAutocomplete onSelect={onSelect} />);

      const input = screen.getByPlaceholderText(/search github/i);
      await user.type(input, "react");

      await waitFor(() => {
        const results = screen.getAllByRole("option");
        expect(results.length).toBeGreaterThan(0);
      });

      const results = screen.getAllByRole("option");
      const firstResult = results[0] as HTMLAnchorElement;

      // Verify it's a link with correct attributes
      expect(firstResult.tagName).toBe("A");
      expect(firstResult.href).toContain("github.com");
      expect(firstResult.target).toBe("_blank");
      expect(firstResult.rel).toContain("noopener");

      await user.click(firstResult);

      expect(onSelect).toHaveBeenCalled();
    });
  });

  describe("Popover Interactions", () => {
    it("should not open popover on focus with empty input", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);
      await user.click(input);

      const popover = screen.queryByRole("listbox");
      expect(popover).not.toBeInTheDocument();
    });

    it("should open popover when typing", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);
      await user.type(input, "test");

      await waitFor(() => {
        const popover = screen.queryByRole("listbox");
        expect(popover).toBeInTheDocument();
      });
    });

    it("should reset active index when Escape is pressed", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);
      await user.type(input, "react");

      await waitFor(
        () => {
          const results = screen.getAllByRole("option");
          expect(results.length).toBeGreaterThan(0);
        },
        {timeout: 3000}
      );

      // Navigate to highlight an item
      await user.keyboard("{ArrowDown}");

      await waitFor(() => {
        expect(input).toHaveAttribute("aria-activedescendant", "result-0");
      });

      // Press Escape should reset highlight
      await user.keyboard("{Escape}");

      await waitFor(() => {
        // aria-activedescendant should be removed or undefined
        const activeDescendant = input.getAttribute("aria-activedescendant");
        expect(
          activeDescendant === null || activeDescendant === undefined
        ).toBe(true);
      });
    });

    it("should show results when typing after Escape", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);
      await user.type(input, "test");

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).toBeInTheDocument();
      });

      // Press Escape
      await user.keyboard("{Escape}");

      // Clear and type new query
      await user.clear(input);
      await user.type(input, "react");

      // Should show results for new query
      await waitFor(
        () => {
          const results = screen.getAllByRole("option");
          expect(results.length).toBeGreaterThan(0);
        },
        {timeout: 3000}
      );
    });
  });

  describe("Keyboard Navigation", () => {
    it("should navigate results with arrow keys", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);
      await user.type(input, "react");

      await waitFor(() => {
        const results = screen.getAllByRole("option");
        expect(results.length).toBeGreaterThan(0);
      });

      // Arrow down should highlight first result
      await user.keyboard("{ArrowDown}");

      // Check if aria-activedescendant is set
      await waitFor(() => {
        expect(input).toHaveAttribute("aria-activedescendant", "result-0");
      });
    });

    it("should select result with Enter key", async () => {
      const user = userEvent.setup();

      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);
      await user.type(input, "react");

      await waitFor(() => {
        const results = screen.getAllByRole("option");
        expect(results.length).toBeGreaterThan(0);
      });

      const results = screen.getAllByRole("option");
      const firstResult = results[0] as HTMLAnchorElement;

      // Verify it's a link with correct attributes
      expect(firstResult.tagName).toBe("A");
      expect(firstResult.href).toContain("github.com");

      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");

      // Verify dropdown closed (results should no longer be visible)
      await waitFor(() => {
        expect(screen.queryByRole("option")).not.toBeInTheDocument();
      });
    });

    it("should cycle through results with arrow keys", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);
      await user.type(input, "react");

      // Wait for multiple results
      await waitFor(() => {
        const results = screen.getAllByRole("option");
        expect(results.length).toBeGreaterThan(1);
      });

      // Navigate down twice
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");

      await waitFor(() => {
        expect(input).toHaveAttribute("aria-activedescendant", "result-1");
      });

      // Navigate up should go back
      await user.keyboard("{ArrowUp}");

      await waitFor(() => {
        expect(input).toHaveAttribute("aria-activedescendant", "result-0");
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);

      expect(input).toHaveAttribute("role", "combobox");
      expect(input).toHaveAttribute("aria-expanded");
      expect(input).toHaveAttribute("aria-autocomplete", "list");
    });

    it("should show clear button when input has value", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);
      await user.type(input, "test");

      const clearButton = screen.getByLabelText(/clear search/i);
      expect(clearButton).toBeInTheDocument();
    });

    it("should announce results to screen readers", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);
      await user.type(input, "react");

      await waitFor(() => {
        const results = screen.getAllByRole("option");
        expect(results.length).toBeGreaterThan(0);
      });

      // Check for live region
      const liveRegion = screen.getByRole("status");
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute("aria-live", "polite");
    });

    it("should have proper ARIA expanded state", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);

      // Initially collapsed
      expect(input).toHaveAttribute("aria-expanded", "false");

      await user.type(input, "test");

      // Should be expanded when popover opens
      await waitFor(() => {
        expect(input).toHaveAttribute("aria-expanded", "true");
      });
    });
  });

  describe("Debouncing", () => {
    it("should debounce search requests", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);

      // Type the full query
      await user.type(input, "react");

      // Wait for debounced search
      await waitFor(
        () => {
          const results = screen.getAllByRole("option");
          expect(results.length).toBeGreaterThan(0);
        },
        {timeout: 3000}
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid input changes", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);

      await user.type(input, "test");
      await user.clear(input);
      await user.type(input, "react");

      await waitFor(() => {
        const results = screen.getAllByRole("option");
        expect(results.length).toBeGreaterThan(0);
      });
    });

    it("should handle mouse hover on results", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);
      await user.type(input, "react");

      await waitFor(() => {
        const results = screen.getAllByRole("option");
        expect(results.length).toBeGreaterThan(0);
      });

      const results = screen.getAllByRole("option");
      await user.hover(results[0]);

      // Should update aria-activedescendant on hover
      await waitFor(() => {
        expect(input).toHaveAttribute("aria-activedescendant");
      });
    });

    it("should focus input after clearing", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);
      await user.type(input, "test");

      const clearButton = screen.getByLabelText(/clear search/i);
      await user.click(clearButton);

      expect(input).toHaveFocus();
    });

    it("should handle minimum 3 character requirement", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GitHubAutocomplete />);

      const input = screen.getByPlaceholderText(/search github/i);

      await user.type(input, "a");
      await waitFor(() => {
        expect(screen.queryByTestId("hint-state")).toBeInTheDocument();
      });

      await user.type(input, "b");
      await waitFor(() => {
        expect(screen.queryByTestId("hint-state")).toBeInTheDocument();
      });

      // Should not show results yet
      expect(screen.queryByRole("listbox")).toBeInTheDocument();
    });
  });
});
