import { expect, test } from "@playwright/test";

/**
 * Reduced-motion usability gate — content and chrome must remain usable
 * with prefers-reduced-motion: reduce.
 */
test.describe("reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("home content stays opaque and menu works", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    expect(
      await page.evaluate(
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    ).toBe(true);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const reveals = page.locator(".atlas-reveal");
    const count = await reveals.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(reveals.nth(i)).toHaveCSS("opacity", "1");
    }

    await page.getByRole("button", { name: /Open menu/i }).click();
    const dialog = page.getByRole("dialog", { name: /Menu/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("work content stays opaque", async ({ page }) => {
    await page.goto("/work");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const reveals = page.locator(".atlas-reveal");
    const count = await reveals.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(reveals.nth(i)).toHaveCSS("opacity", "1");
    }
  });

  test("archive rows remain focusable anchors", async ({ page }) => {
    await page.goto("/articles");
    const row = page.getByRole("link", { name: /Playwright at Scale/i }).first();
    await expect(row).toBeVisible();
    await row.focus();
    await expect(row).toBeFocused();
    await expect(row).toHaveAttribute("href", /\/articles\//);
  });
});
