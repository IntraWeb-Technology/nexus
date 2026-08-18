import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { expectCurrentNavLink } from "./helpers/nav";

const APPROVED_HEADLINE =
  "I’m a senior software engineer working across product development, architecture, testing, and automation.";

test.describe("about", () => {
  test("renders primary landmarks and approved sections", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await expect(page.getByRole("heading", { level: 1, name: APPROVED_HEADLINE })).toBeVisible();

    await expect(page.getByText("CAREER ARC", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("HOW I WORK", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("CURRENT FOCUS", { exact: true }).first()).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Start a conversation" }),
    ).toBeVisible();
  });

  test("marks About as the current nav item", async ({ page }, testInfo) => {
    await page.goto("/about");
    await expectCurrentNavLink(page, "About", testInfo.project.name);
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

  test("visual regression — mobile menu open", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile hamburger only");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/about");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: "Atlas menu" })).toBeVisible();
    await expect(page).toHaveScreenshot(`about-mobile-menu-open-${testInfo.project.name}.png`, {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    });
  });
});
