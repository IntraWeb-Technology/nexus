import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("about", () => {
  test("renders primary landmarks and sections", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "An engineer’s editorial profile.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Observe → Bound → Decide → Prove.",
      }),
    ).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();
  });

  test("marks About as the current nav item", async ({ page }) => {
    await page.goto("/about");
    await expect(
      page
        .getByRole("navigation", { name: "Primary" })
        .getByRole("link", { name: "About" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("skip link moves focus to main", async ({ page }) => {
    await page.goto("/about");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("keyboard can reach contact CTA", async ({ page }) => {
    await page.goto("/about");
    const cta = page.getByRole("link", { name: "Start a conversation" });
    await cta.focus();
    await expect(cta).toBeFocused();
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto("/about");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("visual regression — full page", async ({ page }, testInfo) => {
    await page.goto("/about");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(`about-${testInfo.project.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
