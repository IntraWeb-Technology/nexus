import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("work index", () => {
  test("renders primary landmarks and sections", async ({ page }) => {
    await page.goto("/work");

    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Selected engineering work",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Portfolio OS" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Additional dimensions." }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "How the work is classified.",
      }),
    ).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();
  });

  test("marks Work as the current nav item", async ({ page }) => {
    await page.goto("/work");
    await expect(
      page
        .getByRole("navigation", { name: "Primary" })
        .getByRole("link", { name: "Work" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("navigates from homepage to work", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Work" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Selected engineering work",
      }),
    ).toBeVisible();
  });

  test("skip link moves focus to main", async ({ page }) => {
    await page.goto("/work");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("keyboard can reach featured case study CTA", async ({ page }) => {
    await page.goto("/work");
    const cta = page.getByRole("link", { name: "Read case study" }).first();
    await cta.focus();
    await expect(cta).toBeFocused();
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto("/work");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("visual regression — full page", async ({ page }, testInfo) => {
    await page.goto("/work");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(`work-${testInfo.project.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
