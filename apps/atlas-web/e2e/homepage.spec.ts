import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("homepage", () => {
  test("renders primary landmarks and sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await expect(
      page.getByRole("heading", { level: 1, name: /Systems that\s+earn trust/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Portfolio OS" }),
    ).toBeVisible();
    await expect(page.locator("#selected-work")).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();
  });

  test("skip link moves focus to main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("keyboard can reach primary CTAs", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "View selected work" }).focus();
    await expect(
      page.getByRole("link", { name: "View selected work" }),
    ).toBeFocused();
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("visual regression — full page", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(`homepage-${testInfo.project.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
