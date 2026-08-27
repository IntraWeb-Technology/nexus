import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { expectCurrentNavLink } from "./helpers/nav";

const APPROVED_HEADLINE =
  "I build software systems with the reasoning left in.";

const WORKING_NOTE_LABELS = [
  "WRITTEN REASONING",
  "AI WITH JUDGMENT",
  "SYSTEMS AFTER LAUNCH",
  "PROOF WHERE IT MATTERS",
] as const;

test.describe("about", () => {
  test("renders primary landmarks and approved Story First sections", async ({
    page,
  }) => {
    await page.goto("/about");

    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await expect(
      page.getByRole("heading", { level: 1, name: APPROVED_HEADLINE }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { level: 2, name: "What shaped my craft" }),
    ).toBeVisible();

    await expect(page.getByText("WORKING NOTES", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "What the work keeps teaching me",
      }),
    ).toBeVisible();

    for (const label of WORKING_NOTE_LABELS) {
      await expect(
        page.getByRole("heading", { level: 3, name: label }),
      ).toBeVisible();
    }

    await expect(
      page.getByText(
        "That is usually the standard I’m working toward: interfaces that make the system underneath easier to understand.",
      ),
    ).toBeVisible();

    await expect(
      page.locator("main img").locator("visible=true"),
    ).toHaveAttribute(
      "alt",
      "John Schibelli standing with arms crossed in a sunlit room, wearing glasses and a striped shirt.",
    );
  });

  test("does not restore obsolete How I Work or numbered-principles copy", async ({
    page,
  }) => {
    await page.goto("/about");

    await expect(page.getByText("How I Work", { exact: false })).toHaveCount(0);
    await expect(page.getByText("HOW I WORK", { exact: true })).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "ARCHITECTURE" }),
    ).toHaveCount(0);
    await expect(page.getByText("01", { exact: true })).toHaveCount(0);
  });

  test("marks About as the current nav item", async ({ page }, testInfo) => {
    await page.goto("/about");
    await page.waitForLoadState("networkidle");
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
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
    await expect(page).toHaveScreenshot(
      `about-mobile-menu-open-${testInfo.project.name}.png`,
      {
        fullPage: false,
        maxDiffPixelRatio: 0.02,
      },
    );
  });
});
