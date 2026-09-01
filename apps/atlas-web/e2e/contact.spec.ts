import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { expectCurrentNavLink } from "./helpers/nav";

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

    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Project context")).toBeVisible();
    await expect(page.getByLabel("What are you trying to improve?")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send inquiry" })).toBeVisible();
    await expect(page.getByText("GOOD FIT")).toBeVisible();
    await expect(page.getByText("NEXT STEP")).toBeVisible();
  });

  test("marks Contact as the current nav item", async ({ page }, testInfo) => {
    await page.goto("/contact");
    await expectCurrentNavLink(page, "Contact", testInfo.project.name);
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
    const name = page.getByLabel("Name");
    await name.focus();
    await expect(name).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Email")).toBeFocused();
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send inquiry" }).click();

    await expect(page.getByRole("alert").first()).toBeVisible();
    await expect(page.getByText(/required|valid email/i).first()).toBeVisible();
  });

  test("submits successfully when delivery is available", async ({ page }) => {
    await page.route("**/api/contact", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto("/contact");
    await page.getByLabel("Name").fill("Test Visitor");
    await page.getByLabel("Email").fill("visitor@example.com");
    await page.getByLabel("What are you trying to improve?").fill(
      "Hello — checking the Atlas contact path.",
    );
    await page.getByRole("button", { name: "Send inquiry" }).click();

    await expect(page).toHaveURL(/\/contact\/confirmation/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Message received." }),
    ).toBeVisible();
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
    await page.getByLabel("Name").fill("Test Visitor");
    await page.getByLabel("Email").fill("visitor@example.com");
    await page.getByLabel("What are you trying to improve?").fill("Force failure path.");
    await page.getByRole("button", { name: "Send inquiry" }).click();

    await expect(
      page.getByRole("main").getByRole("alert").filter({
        hasText:
          "Your message could not be sent. Please try again, or email me directly if the issue continues.",
      }),
    ).toBeVisible();
  });

  test("honeypot submission does not show an error", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("Name").fill("Bot");
    await page.getByLabel("Email").fill("bot@example.com");
    await page.getByLabel("What are you trying to improve?").fill("Spam payload");
    await page.locator('input[name="company"]').evaluate((el: HTMLInputElement) => {
      el.value = "http://spam.example";
    });
    await page.getByRole("button", { name: "Send inquiry" }).click();
    await expect(page).toHaveURL(/\/contact\/confirmation/);
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

  test("visual regression — mobile menu open", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile hamburger only");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/contact");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
    await expect(page).toHaveScreenshot(`contact-mobile-menu-open-${testInfo.project.name}.png`, {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    });
  });
});
