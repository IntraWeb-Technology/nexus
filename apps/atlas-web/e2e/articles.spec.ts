import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("articles index", () => {
  test("renders primary landmarks and sections", async ({ page }) => {
    await page.goto("/articles");

    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Engineering writing.",
      }),
    ).toBeVisible();
    await expect(page.getByLabel("Topics")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Why We Chose React Server Components",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Newest first." }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Prefer a conversation over a list.",
      }),
    ).toBeVisible();
  });

  test("marks Articles as the current nav item", async ({ page }) => {
    await page.goto("/articles");
    await expect(
      page
        .getByRole("navigation", { name: "Primary" })
        .getByRole("link", { name: "Articles" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("navigates from primary nav to articles", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Articles" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/articles$/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Engineering writing.",
      }),
    ).toBeVisible();
  });

  test("distinguishes Articles from Documentation", async ({ page }) => {
    await page.goto("/articles");
    await expect(page.getByRole("main")).toContainText(/Documentation/i);
    await expect(page.getByRole("main")).not.toContainText(/newsletter/i);
  });

  test("lists fixture articles newest-first", async ({ page }) => {
    await page.goto("/articles");
    await expect(
      page.getByRole("link", { name: /Playwright at Scale/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Lessons from Building Atlas/i }).first(),
    ).toBeVisible();
    await expect(
      page
        .getByRole("link", { name: /Migrating from Contentful to Strapi/i })
        .first(),
    ).toBeVisible();
    await expect(
      page
        .getByRole("link", { name: /AI-Assisted Engineering Workflows/i })
        .first(),
    ).toBeVisible();
    await expect(
      page
        .getByRole("link", { name: /Turborepo Build Optimization/i })
        .first(),
    ).toBeVisible();
  });

  test("navigates from featured to article detail", async ({ page }) => {
    await page.goto("/articles");
    await page.getByRole("link", { name: "Read article →" }).click();
    await expect(page).toHaveURL(
      /\/articles\/why-we-chose-react-server-components$/,
    );
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Why We Chose React Server Components",
      }),
    ).toBeVisible();
  });

  test("quiet cue links to Contact and Work", async ({ page }) => {
    await page.goto("/articles");
    await expect(
      page.getByRole("link", { name: "Contact →" }),
    ).toHaveAttribute("href", "/contact");
    await expect(page.getByRole("link", { name: "Work →" })).toHaveAttribute(
      "href",
      "/work",
    );
  });

  test("skip link moves focus to main", async ({ page }) => {
    await page.goto("/articles");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto("/articles");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("visual regression — full page", async ({ page }, testInfo) => {
    await page.goto("/articles");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(
      `articles-${testInfo.project.name}.png`,
      {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      },
    );
  });
});
