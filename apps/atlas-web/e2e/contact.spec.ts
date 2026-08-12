import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("contact", () => {
  test("renders primary landmarks and form fields", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Start a conversation.",
      }),
    ).toBeVisible();

    await expect(page.getByLabel("NAME")).toBeVisible();
    await expect(page.getByLabel("EMAIL")).toBeVisible();
    await expect(page.getByLabel("MESSAGE")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  });

  test("marks Contact as the current nav item", async ({ page }) => {
    await page.goto("/contact");
    await expect(
      page
        .getByRole("navigation", { name: "Primary" })
        .getByRole("link", { name: "Contact" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("skip link moves focus to main", async ({ page }) => {
    await page.goto("/contact");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("keyboard can reach form controls", async ({ page }) => {
    await page.goto("/contact");
    const name = page.getByLabel("NAME");
    await name.focus();
    await expect(name).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("EMAIL")).toBeFocused();
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByRole("alert").first()).toBeVisible();
    await expect(page.getByText(/required|valid email/i).first()).toBeVisible();
  });

  test("submits successfully when delivery is available", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("NAME").fill("Test Visitor");
    await page.getByLabel("EMAIL").fill("visitor@example.com");
    await page.getByLabel("MESSAGE").fill("Hello — checking the Atlas contact path.");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByRole("status")).toContainText("Message sent.");
  });

  test("shows failure state when delivery errors", async ({ page }) => {
    await page.route("**/api/contact", async (route) => {
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: "Delivery failed.",
          fields: { form: "Delivery failed. Please try again." },
        }),
      });
    });

    await page.goto("/contact");
    await page.getByLabel("NAME").fill("Test Visitor");
    await page.getByLabel("EMAIL").fill("visitor@example.com");
    await page.getByLabel("MESSAGE").fill("Force failure path.");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(
      page.getByRole("main").getByRole("alert").filter({
        hasText: "Couldn’t send right now.",
      }),
    ).toBeVisible();
  });

  test("honeypot submission does not show an error", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("NAME").fill("Bot");
    await page.getByLabel("EMAIL").fill("bot@example.com");
    await page.getByLabel("MESSAGE").fill("Spam payload");
    // Fill honeypot via DOM (visually hidden)
    await page.locator('input[name="company"]').evaluate((el: HTMLInputElement) => {
      el.value = "http://spam.example";
    });
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("status")).toContainText("Message sent.");
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto("/contact");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("visual regression — full page", async ({ page }, testInfo) => {
    await page.goto("/contact");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(`contact-${testInfo.project.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
