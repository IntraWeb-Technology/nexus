import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { settleMotionReveals } from "./helpers/motion";
import { clickPrimaryNavLink, expectCurrentNavLink } from "./helpers/nav";

test.describe("work index", () => {
  test("renders primary landmarks and full Story-First gallery", async ({
    page,
  }) => {
    await page.goto("/work");

    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /A closer look at what I've been building/i,
      }),
    ).toBeVisible();

    for (const name of [
      "Atlas",
      "IntraWeb Automation",
      "Portfolio OS",
      "IntraWeb Portal",
    ]) {
      await expect(page.getByRole("heading", { level: 3, name })).toBeVisible();
    }
  });

  test("marks Work as the current nav item", async ({ page }, testInfo) => {
    await page.goto("/work");
    await expectCurrentNavLink(page, "Work", testInfo.project.name);
  });

  test("navigates from homepage to work", async ({ page }, testInfo) => {
    await page.goto("/");
    await clickPrimaryNavLink(page, "Work", testInfo.project.name);
    await expect(page).toHaveURL(/\/work$/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /A closer look at what I've been building/i,
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

  test("keyboard can reach case study CTA", async ({ page }) => {
    await page.goto("/work");
    const cta = page.getByRole("link", { name: "Read the case study →" }).first();
    await cta.focus();
    await expect(cta).toBeFocused();
  });

  test("case study links only resolve to implemented routes", async ({
    page,
  }) => {
    await page.goto("/work");

    const caseLinks = page.getByRole("link", { name: "Read the case study →" });
    await expect(caseLinks).toHaveCount(2);
    await expect(caseLinks.first()).toHaveAttribute("href", "/work/portfolio-os");
    await expect(caseLinks.nth(1)).toHaveAttribute("href", "/work/portfolio-os");

    for (const href of [
      "/work/shared-strapi-cms",
      "/work/intraweb-automation",
      "/work/vehicle-maintenance",
      "/work/intraweb-portal",
    ]) {
      await expect(page.locator(`a[href="${href}"]`)).toHaveCount(0);
    }
  });

  test("portfolio-os case study resolves from gallery CTA", async ({ page }) => {
    await page.goto("/work");
    await page.getByRole("link", { name: "Read the case study →" }).first().click();
    await expect(page).toHaveURL(/\/work\/portfolio-os$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Portfolio OS/i }),
    ).toBeVisible();
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
    await settleMotionReveals(page);
    await expect(page).toHaveScreenshot(`work-${testInfo.project.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
