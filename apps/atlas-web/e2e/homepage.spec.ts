import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { settleMotionReveals } from "./helpers/motion";

test.describe("homepage", () => {
  test("renders primary landmarks and sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /This is where I keep the work/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Latest work" }),
    ).toBeVisible();
    await expect(page.locator("#selected-work")).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();
  });

  test("mobile menu opens with approved overlay", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Menu overlay is mobile-only");
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Work", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Articles", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "About", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Contact", exact: true }),
    ).toBeVisible();
  });

  test("visual regression — mobile menu open", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile hamburger only");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
    await expect(page).toHaveScreenshot(`homepage-mobile-menu-open-${testInfo.project.name}.png`, {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("skip link moves focus to main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("keyboard can reach primary CTAs", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "See the work" }).focus();
    await expect(page.getByRole("link", { name: "See the work" })).toBeFocused();
  });

  test("hero CTAs navigate to work and articles", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.getByRole("link", { name: "See the work" }).click();
    await expect(page).toHaveURL(/\/work$/);
    await page.goto("/");
    const notes = page.getByRole("link", { name: "Read the notes" });
    if (testInfo.project.name !== "desktop") {
      await expect(notes).toBeHidden();
      return;
    }
    await notes.click();
    await expect(page).toHaveURL(/\/articles$/);
  });

  test("omits Latest writing on mobile", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "616:18 omits Writing on mobile");
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 2, name: "Latest writing" }),
    ).toHaveCount(0);
  });

  test("home writing card uses the full RSC title", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Writing is omitted from the mobile Home composition",
    );
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: "Why We Chose React Server Components",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Why We Chose RSC", exact: true }),
    ).toHaveCount(0);
  });

  test("tablet hero is photo then copy with one CTA", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "tablet", "C3 tablet composition only");
    await page.goto("/");
    const hero = page.locator("main section").first();
    const photo = hero.locator("img").first();
    const title = page.getByRole("heading", { level: 1 });
    const photoBox = await photo.boundingBox();
    const titleBox = await title.boundingBox();
    expect(photoBox, "hero photo bounding box").toBeTruthy();
    expect(titleBox, "hero title bounding box").toBeTruthy();
    expect(photoBox!.y).toBeLessThan(titleBox!.y);
    await expect(hero.getByRole("link", { name: "See the work" })).toBeVisible();
    await expect(hero.getByRole("link", { name: "Read the notes" })).toBeHidden();
  });

  test("tablet footer keeps all chrome without a crowded row", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "tablet", "C9 tablet footer only");
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    const copyright = footer.getByText(/John Schibelli — Atlas/);
    const docs = footer.getByRole("navigation", { name: "Footer" }).getByRole(
      "link",
      { name: "Docs" },
    );
    const copyrightBox = await copyright.boundingBox();
    const docsBox = await docs.boundingBox();
    expect(copyrightBox, "copyright bounding box").toBeTruthy();
    expect(docsBox, "Docs link bounding box").toBeTruthy();
    expect(docsBox!.y).toBeGreaterThan(copyrightBox!.y);
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 1;
    });
    expect(overflow, "horizontal overflow from tablet footer").toBe(false);
  });

  test("footer nav order and social links", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    const footerNav = footer.getByRole("navigation", { name: "Footer" });
    const labels = await footerNav.getByRole("link").allTextContents();
    expect(labels.map((l) => l.trim())).toEqual([
      "Work",
      "Articles",
      "About",
      "Contact",
      "Docs",
    ]);
    await expect(footer.getByText(/John Schibelli — Atlas/)).toBeVisible();
    for (const name of ["LinkedIn", "GitHub", "Bluesky", "Upwork"]) {
      await expect(footer.getByRole("link", { name })).toBeVisible();
    }
  });

  test("mobile menu link order", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile hamburger only");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu).toBeVisible();
    await expect(menu.getByText("Navigation")).toHaveCount(0);
    const navLinks = menu.locator("ul").first().getByRole("link");
    await expect(navLinks).toHaveCount(4);
    await expect(navLinks).toHaveText(["Work", "Articles", "About", "Contact"]);
    for (const name of ["LinkedIn", "GitHub", "Bluesky", "Upwork"]) {
      await expect(menu.getByRole("link", { name })).toBeVisible();
    }
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto("/");
    await settleMotionReveals(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("visual regression — full page", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await settleMotionReveals(page);
    await expect(page).toHaveScreenshot(`homepage-${testInfo.project.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("no horizontal overflow at viewport", async ({ page }, testInfo) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 1;
    });
    expect(overflow, `horizontal overflow on ${testInfo.project.name}`).toBe(
      false,
    );
  });
});
