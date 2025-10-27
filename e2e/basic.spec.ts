import {expect, test} from "@playwright/test";

test.describe("Basic E2E Test", () => {
  test("should load the page", async ({page}) => {
    await page.goto("/");

    // Check if page loaded
    await expect(page).toHaveTitle(/GitHub Autocomplete Component/);

    // Check if heading exists
    await expect(
      page.getByText(/GitHub Repository & User Search/i)
    ).toBeVisible();
  });

  test("should find input by placeholder", async ({page}) => {
    await page.goto("/");

    // Try to find by placeholder first
    const input = page.getByPlaceholder(/search github/i);
    await expect(input).toBeVisible();
  });

  test("should find input by data-testid", async ({page}) => {
    await page.goto("/");

    // Wait for the page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Try to find by data-testid
    const input = page.getByTestId("search-input");
    await expect(input).toBeVisible();

    // Debug: log the HTML to see what's there
    const html = await page.content();
    console.log(
      "Page HTML includes data-testid:",
      html.includes('data-testid="search-input"')
    );
  });
});
