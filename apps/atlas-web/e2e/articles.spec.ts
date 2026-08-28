import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { clickPrimaryNavLink, expectCurrentNavLink } from "./helpers/nav";

test.describe("articles index", () => {
  test("renders primary landmarks and sections", async ({ page }) => {
    await page.goto("/articles");

    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Writing on architecture, testing, and the craft of building.",
      }),
    ).toBeVisible();
    await expect(page.getByLabel("Topics")).toHaveCount(0);
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Why We Chose React Server Components",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "More writing" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Prefer a conversation over a list.",
      }),
    ).toHaveCount(0);
  });

  test("marks Articles as the current nav item", async ({ page }, testInfo) => {
    await page.goto("/articles");
    await expectCurrentNavLink(page, "Articles", testInfo.project.name);
  });

  test("navigates from primary nav to articles", async ({ page }, testInfo) => {
    await page.goto("/");
    await clickPrimaryNavLink(page, "Articles", testInfo.project.name);
    await expect(page).toHaveURL(/\/articles$/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Writing on architecture, testing, and the craft of building.",
      }),
    ).toBeVisible();
  });

  test("distinguishes Articles from Documentation", async ({ page }) => {
    await page.goto("/articles");
    await expect(page.getByRole("main")).toContainText(/Documentation/i);
    await expect(page.getByRole("main")).not.toContainText(/newsletter/i);
  });

  test("does not render Publication Shape", async ({ page }) => {
    await page.goto("/articles");
    await expect(page.getByRole("main")).not.toContainText(/Publication Shape/i);
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

  test("does not render Topics or CONTINUE cue", async ({ page }) => {
    await page.goto("/articles");
    await expect(page.getByLabel("Topics")).toHaveCount(0);
    await expect(page.getByText("CONTINUE", { exact: true })).toHaveCount(0);
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Prefer a conversation over a list.",
      }),
    ).toHaveCount(0);
  });

  test("featured metadata has no Published status", async ({ page }) => {
    await page.goto("/articles");
    const featured = page.getByRole("heading", {
      level: 2,
      name: "Why We Chose React Server Components",
    }).locator("..");
    await expect(featured).toContainText(/Apr 2, 2025/);
    await expect(featured).toContainText(/Architecture/);
    await expect(featured).toContainText(/14 min/);
    await expect(featured).not.toContainText(/Published/i);
    await expect(page.getByRole("main")).not.toContainText(/Read article/i);
  });

  test("archive rows have no standalone Read article or Proof labels", async ({
    page,
  }) => {
    await page.goto("/articles");
    const list = page.getByRole("heading", { level: 2, name: "More writing" })
      .locator("xpath=ancestor::section[1]");
    await expect(list).not.toContainText(/Read article/i);
    await expect(list).not.toContainText(/Proof:/i);
    await expect(list).toContainText(/Testing/);
  });

  test("article list links resolve to detail routes", async ({ page }) => {
    await page.goto("/articles");
    await page
      .getByRole("link", { name: /Playwright at Scale/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/articles\/playwright-at-scale$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Playwright at Scale" }),
    ).toBeVisible();
  });

  test("navigates from featured to article detail", async ({ page }) => {
    await page.goto("/articles");
    await page
      .getByRole("heading", {
        level: 2,
        name: "Why We Chose React Server Components",
      })
      .click();
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

  test("does not render CONTINUE contact cue on the index", async ({
    page,
  }) => {
    await page.goto("/articles");
    const main = page.getByRole("main");
    await expect(
      main.getByRole("heading", {
        level: 2,
        name: "Prefer a conversation over a list.",
      }),
    ).toHaveCount(0);
    await expect(
      main.getByRole("link", { name: "Start a conversation" }),
    ).toHaveCount(0);
    await expect(main.getByRole("link", { name: /browse Work/i })).toHaveCount(
      0,
    );
  });

  test("does not advertise fictional archive pagination", async ({ page }) => {
    await page.goto("/articles");
    await expect(
      page.getByRole("navigation", { name: "ARCHIVE PAGES" }),
    ).toHaveCount(0);
    await expect(page.getByText("Page 1 of 3")).toHaveCount(0);
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

  test("visual regression — mobile menu open", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile hamburger only");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/articles");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
    await expect(page).toHaveScreenshot(`articles-mobile-menu-open-${testInfo.project.name}.png`, {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("no horizontal overflow at viewport", async ({ page }, testInfo) => {
    await page.goto("/articles");
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 1;
    });
    expect(overflow, `horizontal overflow on ${testInfo.project.name}`).toBe(
      false,
    );
  });

  test("no Publication Shape panel", async ({ page }) => {
    await page.goto("/articles");
    await expect(page.getByRole("main")).not.toContainText("Publication Shape");
  });

  test("featured hero metadata has no Published status", async ({ page }) => {
    await page.goto("/articles");
    const featured = page.getByRole("heading", {
      level: 2,
      name: "Why We Chose React Server Components",
    }).locator("xpath=ancestor::section[1]");
    await expect(featured).not.toContainText("Published");
    await expect(featured).not.toContainText("STATUS");
  });

  test("archive rows have no Read article or Proof labels", async ({ page }) => {
    await page.goto("/articles");
    const list = page.getByRole("heading", { level: 2, name: "Newest first." })
      .locator("xpath=ancestor::section[1]");
    await expect(list.getByText("Read article")).toHaveCount(0);
    await expect(list.getByText(/Proof:/i)).toHaveCount(0);
  });
});
