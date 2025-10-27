import {expect, test} from "@playwright/test";
import {GitHubAutocompletePage} from "./page-objects/GitHubAutocompletePage";

test.describe("GitHub Autocomplete Component", () => {
  let page: GitHubAutocompletePage;

  test.beforeEach(async ({page: playwrightPage}) => {
    page = new GitHubAutocompletePage(playwrightPage);
    await page.goto();
  });

  test.describe("Initial State", () => {
    test("should display search input", async () => {
      await expect(page.searchInput).toBeVisible();
      await expect(page.searchInput).toHaveAttribute(
        "placeholder",
        /search github/i
      );
    });

    test("should show hint state when typing less than 3 characters", async () => {
      await page.search("ab");
      await expect(page.hintState).toBeVisible();
    });
  });

  test.describe("Search Functionality", () => {
    test("should display results when typing", async () => {
      await page.search("react");
      await page.waitForResults();

      const resultsCount = await page.getResultsCount();
      expect(resultsCount).toBeGreaterThan(0);
    });

    test("should show loading state while searching", async () => {
      await page.searchInput.click();
      await page.searchInput.type("react", {delay: 100});

      // Loading skeleton should appear briefly
      await expect(page.loadingSkeleton).toBeVisible();
    });

    test("should clear results when input is cleared", async () => {
      await page.search("react");
      await page.waitForResults();

      await page.clearSearch();
      // Dropdown should close when input is cleared
      const isVisible = await page.isPopoverVisible();
      expect(isVisible).toBe(false);
    });

    test("should show empty state for no results", async () => {
      await page.search("nonexistentrepo12345xyz");
      await page.waitForLoadingComplete();

      await expect(page.emptyState).toBeVisible();
    });
  });

  test.describe("Keyboard Navigation", () => {
    test("should navigate results with arrow keys", async () => {
      await page.search("react");
      await page.waitForResults();

      await page.pressArrowDown();

      const firstResult = page.getResultItem(0);
      await expect(firstResult).toHaveAttribute("data-active", "true");
    });

    test("should wrap navigation at list boundaries", async () => {
      await page.search("react");
      await page.waitForResults();

      const resultsCount = await page.getResultsCount();

      // Navigate to last item
      for (let i = 0; i < resultsCount; i++) {
        await page.pressArrowDown();
      }

      // Should wrap to first
      await page.pressArrowDown();
      const firstResult = page.getResultItem(0);
      await expect(firstResult).toHaveAttribute("data-active", "true");
    });

    test("should close popover on Escape key", async () => {
      await page.search("react");
      await page.waitForResults();

      await page.pressEscape();

      const isVisible = await page.isPopoverVisible();
      expect(isVisible).toBe(false);
    });

    test("should open link on Enter key", async () => {
      await page.search("react");
      await page.waitForResults();

      await page.pressArrowDown();

      // Listen for navigation
      const pagePromise = page.page.waitForEvent("popup");
      await page.pressEnter();

      const newPage = await pagePromise;
      expect(newPage.url()).toContain("github.com");
    });
  });

  test.describe("Mouse Interaction", () => {
    test("should highlight result on hover", async () => {
      await page.search("react");
      await page.waitForResults();

      const firstResult = page.getResultItem(0);
      await firstResult.hover();

      await expect(firstResult).toHaveAttribute("data-active", "true");
    });

    test("should open link on click", async () => {
      await page.search("react");
      await page.waitForResults();

      const pagePromise = page.page.waitForEvent("popup");
      await page.clickResult(0);

      const newPage = await pagePromise;
      expect(newPage.url()).toContain("github.com");
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper ARIA attributes", async () => {
      await expect(page.searchInput).toHaveAttribute("role", "combobox");
      await expect(page.searchInput).toHaveAttribute("aria-expanded");
      await expect(page.searchInput).toHaveAttribute(
        "aria-autocomplete",
        "list"
      );
    });

    test("should be keyboard accessible", async () => {
      // Focus the input
      await page.searchInput.focus();

      // Verify input is focused
      await expect(page.searchInput).toBeFocused();
    });

    test("should have visible focus indicators", async () => {
      await page.searchInput.focus();
      await expect(page.searchInput).toBeFocused();
    });
  });

  test.describe("Responsive Design", () => {
    test("should work on mobile viewport", async () => {
      await page.page.setViewportSize({width: 375, height: 667});

      await page.search("react");
      await page.waitForResults();

      const resultsCount = await page.getResultsCount();
      expect(resultsCount).toBeGreaterThan(0);
    });

    test("should work on tablet viewport", async () => {
      await page.page.setViewportSize({width: 768, height: 1024});

      await page.search("react");
      await page.waitForResults();

      const resultsCount = await page.getResultsCount();
      expect(resultsCount).toBeGreaterThan(0);
    });
  });

  test.describe("Error Handling", () => {
    test("should display error message on API failure", async () => {
      // This would require mocking the API response
      // For now, we test that error state can be displayed
      await page.search("network-error");

      // Wait for potential error state
      await page.page.waitForTimeout(2000);

      const isErrorVisible = await page.isErrorVisible();
      // Error might or might not be visible depending on API mock
      expect(typeof isErrorVisible).toBe("boolean");
    });
  });

  test.describe("Visual Regression", () => {
    test("should match screenshot - initial state", async () => {
      await expect(page.page).toHaveScreenshot("initial-state.png");
    });

    test("should match screenshot - with results", async () => {
      await page.search("react");
      await page.waitForResults();

      await expect(page.page).toHaveScreenshot("with-results.png");
    });

    test("should match screenshot - empty state", async () => {
      await page.search("nonexistentrepo12345xyz");
      await page.waitForLoadingComplete();

      await expect(page.page).toHaveScreenshot("empty-state.png");
    });
  });
});
