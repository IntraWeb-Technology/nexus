import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { expectCurrentNavLink } from "./helpers/nav";

test.describe("case study — Portfolio OS", () => {
  test("renders Story-First landmarks and sections", async ({ page }) => {
    await page.goto("/work/portfolio-os");

    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.locator("#main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await expect(
      page.getByRole("heading", { level: 1, name: "Portfolio OS" }),
    ).toBeVisible();

    await expect(page.getByRole("heading", { level: 2, name: "Overview" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What was built" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Why it mattered" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What I owned" })).toBeVisible();

    await expect(page.locator("#under-the-hood")).toBeVisible();
    await expect(page.getByText("CONSTRAINT", { exact: true })).toBeVisible();
    await expect(page.getByText("DECISION", { exact: true })).toBeVisible();
    await expect(page.getByText("DELIVERY", { exact: true })).toBeVisible();

    await expect(
      page.getByRole("heading", { level: 2, name: "Outcomes & lessons" }),
    ).toBeVisible();

    await expect(page.getByRole("navigation", { name: "Case study contents" })).toHaveCount(0);
  });

  test("marks Work as the current nav item", async ({ page }, testInfo) => {
    await page.goto("/work/portfolio-os");
    await expectCurrentNavLink(page, "Work", testInfo.project.name);
  });

  test("navigates from work index to case study", async ({ page }) => {
    await page.goto("/work");
    await page.getByRole("link", { name: "Read the case study →" }).first().click();
    await expect(page).toHaveURL(/\/work\/portfolio-os$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Portfolio OS" }),
    ).toBeVisible();
  });

  test("skip link moves focus to main", async ({ page }) => {
    await page.goto("/work/portfolio-os");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("unknown slug returns 404", async ({ page }) => {
    const response = await page.goto("/work/does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto("/work/portfolio-os");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("visual regression — full page", async ({ page }, testInfo) => {
    await page.goto("/work/portfolio-os");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(
      `case-study-${testInfo.project.name}.png`,
      {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      },
    );
  });

  test("visual regression — mobile menu open", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile hamburger only");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/work/portfolio-os");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
    await expect(page).toHaveScreenshot("case-study-mobile-menu-open.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    });
  });
});
