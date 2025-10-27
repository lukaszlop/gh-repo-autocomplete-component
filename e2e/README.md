# E2E Tests - Playwright

## Page Object Model

This project follows the Page Object Model (POM) pattern for E2E tests. Page objects encapsulate page structure and interactions, making tests more maintainable and readable.

## Structure

```
e2e/
├── page-objects/
│   └── GitHubAutocompletePage.ts    # Page object for main component
├── github-autocomplete.spec.ts       # E2E tests
└── README.md                         # This file
```

## Using Page Objects

### Basic Example

```typescript
import {test, expect} from "@playwright/test";
import {GitHubAutocompletePage} from "./page-objects/GitHubAutocompletePage";

test("should search repositories", async ({page: playwrightPage}) => {
  const page = new GitHubAutocompletePage(playwrightPage);

  // Navigate to page
  await page.goto();

  // Perform search
  await page.search("react");
  await page.waitForResults();

  // Verify results
  const count = await page.getResultsCount();
  expect(count).toBeGreaterThan(0);
});
```

### Creating New Page Objects

1. **Create page object file**

```typescript
// e2e/page-objects/MyPage.ts
import {Page, Locator} from "@playwright/test";

export class MyPage {
  readonly page: Page;
  readonly myElement: Locator;

  constructor(page: Page) {
    this.page = page;
    this.myElement = page.getByTestId("my-element");
  }

  async goto() {
    await this.page.goto("/my-route");
  }

  async clickElement() {
    await this.myElement.click();
  }
}
```

2. **Use in tests**

```typescript
import {test} from "@playwright/test";
import {MyPage} from "./page-objects/MyPage";

test("my test", async ({page: playwrightPage}) => {
  const page = new MyPage(playwrightPage);
  await page.goto();
  await page.clickElement();
});
```

## Selector Strategy

### Always use `data-testid`

```tsx
// Component
<button data-testid='submit-button'>Submit</button>;

// Page Object
this.submitButton = page.getByTestId("submit-button");

// Test
await page.submitButton.click();
```

### Why data-testid?

- **Resilient**: Not affected by styling or text changes
- **Clear Intent**: Explicitly marks elements for testing
- **Best Practice**: Recommended by Playwright and Testing Library

### Other Selectors (use sparingly)

```typescript
// Role-based (good for accessibility)
page.getByRole("button", {name: "Submit"});

// Text-based (fragile, avoid for localization)
page.getByText("Submit");

// CSS selector (last resort)
page.locator(".submit-button");
```

## Common Patterns

### Setup and Teardown

```typescript
test.describe("Feature", () => {
  let page: MyPage;

  test.beforeEach(async ({page: playwrightPage}) => {
    page = new MyPage(playwrightPage);
    await page.goto();
  });

  test("test 1", async () => {
    // Test code
  });

  test("test 2", async () => {
    // Test code
  });
});
```

### Waiting for Elements

```typescript
// Wait for element to be visible
await page.myElement.waitFor({state: "visible"});

// Wait for element to be hidden
await page.myElement.waitFor({state: "hidden"});

// Wait for custom condition
await page.page.waitForFunction(() => {
  return document.querySelector("[data-loaded='true']") !== null;
});
```

### Handling Dialogs

```typescript
// Alert/Confirm/Prompt
page.page.on("dialog", async (dialog) => {
  await dialog.accept();
});
```

### Keyboard Navigation

```typescript
await page.searchInput.press("ArrowDown");
await page.searchInput.press("Enter");
await page.searchInput.press("Escape");
```

### Multiple Tabs/Windows

```typescript
const pagePromise = page.page.waitForEvent("popup");
await page.clickLinkInNewTab();
const newPage = await pagePromise;

expect(newPage.url()).toContain("expected-url");
await newPage.close();
```

## Debugging E2E Tests

### Debug Mode

```bash
npm run test:e2e:debug
```

This opens Playwright Inspector where you can:

- Step through test
- Inspect elements
- View console logs
- See network requests

### Screenshots

```typescript
// Take screenshot
await page.page.screenshot({path: "screenshot.png"});

// Full page screenshot
await page.page.screenshot({
  path: "screenshot.png",
  fullPage: true,
});
```

### Videos

Videos are automatically recorded on test failure (configured in `playwright.config.ts`).

Find them in: `test-results/`

### Trace Viewer

```bash
# View trace for failed test
npm run test:e2e:report
```

## Visual Testing

### Screenshot Comparison

```typescript
test("visual regression", async ({page: playwrightPage}) => {
  const page = new MyPage(playwrightPage);
  await page.goto();

  // Compare with baseline
  await expect(page.page).toHaveScreenshot("baseline.png");
});
```

### Update Baseline

```bash
npx playwright test --update-snapshots
```

## Best Practices

1. **One Page Object per Page/Component**

   - Keep page objects focused and cohesive
   - Split large pages into multiple objects

2. **Meaningful Method Names**

   - Use action-based names: `clickSubmit()`, `fillForm()`
   - Avoid generic names: `click()`, `fill()`

3. **Return Values**

   - Return data from page objects when needed
   - Keep assertions in tests, not page objects

4. **Reusable Actions**

   - Create helper methods for common workflows
   - Keep DRY (Don't Repeat Yourself)

5. **Type Safety**
   - Use TypeScript for page objects
   - Leverage Playwright's type definitions

## Example: Complete Page Object

```typescript
import {Page, Locator} from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId("email-input");
    this.passwordInput = page.getByTestId("password-input");
    this.submitButton = page.getByTestId("submit-button");
    this.errorMessage = page.getByTestId("error-message");
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) || "";
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.page.url().includes("/dashboard");
  }
}
```

## Visual Regression Tests - Platform Considerations

⚠️ **Important:** Visual regression tests are **platform-specific** and have special handling in this project.

### Current Setup

- Snapshots are generated on **macOS** (darwin)
- CI runs on **Linux** (ubuntu)
- Screenshots differ between platforms due to font rendering and other OS differences

### CI Configuration

Visual regression tests are **excluded from CI** to avoid false failures:

```bash
# CI runs this command
npm run test:e2e -- --grep-invert "Visual Regression"
```

### Running Visual Tests Locally

```bash
# Run all tests including visual regression
npm run test:e2e

# Update snapshots for your platform
npm run test:e2e -- --update-snapshots
```

### Generating Cross-Platform Snapshots

If you need to generate Linux snapshots for CI:

1. Use Docker or a Linux VM
2. Run: `npm run test:e2e -- --update-snapshots`
3. Commit the generated `*-linux.png` files

### Timeout Configuration

Tests that make real API calls (GitHub search) have increased timeouts:

- Local: 15 seconds (default)
- CI: 15 seconds with 2 retry attempts
- Reason: GitHub API rate limiting and network latency

If you see timeout errors in `waitForResults()`, the GitHub API may be rate-limiting or experiencing issues.

## Resources

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Locators](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
