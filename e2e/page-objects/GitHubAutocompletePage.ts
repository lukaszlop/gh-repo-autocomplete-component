import {Locator, Page} from "@playwright/test";

/**
 * Page Object Model for GitHubAutocomplete component
 * Follows Playwright best practices with data-testid selectors
 */
export class GitHubAutocompletePage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchResultsList: Locator;
  readonly emptyState: Locator;
  readonly errorState: Locator;
  readonly hintState: Locator;
  readonly loadingSkeleton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Primary elements - use placeholder for input as data-testid doesn't work with shadcn Input
    this.searchInput = page.getByPlaceholder(/search github/i);
    this.searchResultsList = page.locator(
      'div[data-testid="search-results-list"], #search-results'
    );

    // State elements
    this.emptyState = page.getByTestId("empty-state");
    this.errorState = page.getByTestId("error-display");
    this.hintState = page.getByTestId("hint-state");
    this.loadingSkeleton = page.getByTestId("loading-skeleton");
  }

  /**
   * Navigate to the application
   */
  async goto() {
    await this.page.goto("/");
  }

  /**
   * Type into the search input
   */
  async search(query: string) {
    await this.searchInput.fill(query);
  }

  /**
   * Clear the search input
   */
  async clearSearch() {
    await this.searchInput.clear();
  }

  /**
   * Get a search result item by index
   */
  getResultItem(index: number): Locator {
    return this.page.locator(`[role="option"]`).nth(index);
  }

  /**
   * Get the count of search results
   */
  async getResultsCount(): Promise<number> {
    return await this.page.locator(`[role="option"]`).count();
  }

  /**
   * Click on a search result by index
   */
  async clickResult(index: number) {
    await this.getResultItem(index).click();
  }

  /**
   * Navigate using keyboard arrows
   */
  async pressArrowDown() {
    await this.searchInput.press("ArrowDown");
  }

  async pressArrowUp() {
    await this.searchInput.press("ArrowUp");
  }

  async pressEnter() {
    await this.searchInput.press("Enter");
  }

  async pressEscape() {
    await this.searchInput.press("Escape");
  }

  /**
   * Check if results popover is visible
   */
  async isPopoverVisible(): Promise<boolean> {
    const popover = this.page.locator('[role="listbox"]');
    try {
      return await popover.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Wait for search results to load
   */
  async waitForResults() {
    // Increase timeout for CI environments where API calls might be slower
    await this.page
      .locator('[role="option"]')
      .first()
      .waitFor({state: "visible", timeout: 15000});
  }

  /**
   * Wait for loading state to disappear
   */
  async waitForLoadingComplete() {
    // Wait for loading skeleton to appear first, or timeout quickly if it doesn't
    try {
      await this.loadingSkeleton.waitFor({state: "visible", timeout: 1000});
      // If it appeared, wait for it to disappear
      await this.loadingSkeleton.waitFor({state: "hidden", timeout: 5000});
    } catch {
      // If loading skeleton never appeared, that's fine - API was fast
      // Just add a small delay to ensure content has rendered
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Get the focused element's role
   */
  async getFocusedElement(): Promise<Locator | null> {
    return this.page.locator(":focus");
  }

  /**
   * Check if hint state is visible
   */
  async isHintVisible(): Promise<boolean> {
    return await this.hintState.isVisible();
  }

  /**
   * Check if empty state is visible
   */
  async isEmptyStateVisible(): Promise<boolean> {
    return await this.emptyState.isVisible();
  }

  /**
   * Check if error state is visible
   */
  async isErrorVisible(): Promise<boolean> {
    return await this.errorState.isVisible();
  }
}
