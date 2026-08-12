import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("production media (M7)", () => {
  test("home hero renders production image with meaningful alt", async ({
    page,
  }) => {
    await page.goto("/");
    const hero = page.locator("main section").first().locator("img").first();
    await expect(hero).toBeVisible();
    await expect(hero).toHaveAttribute("alt", /handbook|Portfolio OS|Atlas/i);
    await expect(hero).not.toHaveAttribute("alt", /\.webp$/i);
  });

  test("home selected work uses real project identities", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Shared Strapi CMS / Atlas" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "IntraWeb Automation Platform" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Vehicle Maintenance Platform" }),
    ).toBeVisible();
    await expect(page.getByText("Project A")).toHaveCount(0);
  });

  test("work featured figure is production media", async ({ page }) => {
    await page.goto("/work");
    const figure = page.locator("figure").first();
    await expect(figure.locator("img")).toBeVisible();
    await expect(figure.locator("img")).toHaveAttribute(
      "alt",
      /Portfolio OS|architecture/i,
    );
    await expect(figure.getByText("IMG")).toHaveCount(0);
  });

  test("work selected Strapi and Automation media render; Vehicle remains blocked", async ({
    page,
  }) => {
    await page.goto("/work");
    await expect(
      page.getByRole("img", { name: /Shared Strapi/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("img", { name: /IntraWeb|n8n|orchestration/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("img", {
        name: /Vehicle Maintenance production media blocked/i,
      }),
    ).toHaveCount(1);
  });

  test("case study hero retires placeholder panels label", async ({ page }) => {
    await page.goto("/work/portfolio-os");
    const heroFigure = page.locator("figure").first();
    await expect(heroFigure.locator("img")).toBeVisible();
    await expect(page.getByText("portfolio-os  ·  production surface")).toHaveCount(
      0,
    );
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
