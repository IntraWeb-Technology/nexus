import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("production media (M7 / Story-First)", () => {
  test("home hero renders production image with meaningful alt", async ({
    page,
  }) => {
    await page.goto("/");
    const hero = page.locator("main section").first().locator("img").first();
    await expect(hero).toBeVisible();
    await expect(hero).toHaveAttribute("alt", /handbook|Portfolio OS|Atlas|John|workspace/i);
    await expect(hero).not.toHaveAttribute("alt", /\.webp$/i);
  });

  test("home latest work uses Story-First project identities", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Atlas" }).first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "IntraWeb Automation" }),
    ).toBeVisible();
    await expect(page.getByText("Project A")).toHaveCount(0);
  });

  test("work gallery exposes four Story-First media surfaces", async ({
    page,
  }) => {
    await page.goto("/work");
    for (const name of [
      "Atlas",
      "IntraWeb Automation",
      "Portfolio OS",
      "IntraWeb Portal",
    ]) {
      await expect(page.getByRole("heading", { level: 3, name })).toBeVisible();
    }
    await expect(
      page.getByRole("img", { name: /PHOTO — Atlas/i }),
    ).toBeVisible();
    await expect(page.getByText(/^IMG$/)).toHaveCount(0);
  });

  test("case study under-the-hood diagram surface is present", async ({
    page,
  }) => {
    await page.goto("/work/portfolio-os");
    await expect(page.locator("#under-the-hood")).toBeVisible();
    await expect(
      page.getByText(/DIAGRAM — request\/delivery architecture/i),
    ).toBeVisible();
    await expect(
      page.getByText("portfolio-os  ·  production surface"),
    ).toHaveCount(0);
  });

  test("favicon and default OG metadata are wired", async ({ page }) => {
    await page.goto("/");
    const icons = page.locator('link[rel="icon"]');
    await expect(icons.first()).toHaveAttribute("href", /favicon\.svg/);
    const og = page.locator('meta[property="og:image"]');
    await expect(og.first()).toHaveAttribute("content", /\/og\/default\.png/);
  });

  test("contact remains imagery-free", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("main img")).toHaveCount(0);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});
