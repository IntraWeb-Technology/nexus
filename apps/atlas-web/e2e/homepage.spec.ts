import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("homepage", () => {
  test("renders primary landmarks and sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await expect(
      page.getByRole("heading", { level: 1, name: /I design and build software systems/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Atlas" }),
    ).toBeVisible();
    await expect(page.locator("#selected-work")).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();
  });

  test("mobile menu opens with approved overlay", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Menu overlay is mobile-only");
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: "Atlas menu" })).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: "Atlas menu" }).getByRole("link", { name: "Work", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: "Atlas menu" }).getByRole("link", { name: "Articles", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: "Atlas menu" }).getByRole("link", { name: "About", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: "Atlas menu" }).getByRole("link", { name: "Contact", exact: true }),
    ).toBeVisible();
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
    await page.getByRole("link", { name: "View selected work" }).focus();
    await expect(
      page.getByRole("link", { name: "View selected work" }),
    ).toBeFocused();
  });

  test("in-page hero CTAs do not soft-navigate via RSC", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const samePageRsc: string[] = [];
    page.on("request", (req) => {
      if (req.headers()["rsc"] !== "1") return;
      const url = new URL(req.url());
      // Hash CTAs must not RSC-fetch the current route. Prefetch of other
      // work/case links is expected with Next <Link> and is out of scope.
      if (url.pathname === "/" || url.pathname === "") {
        samePageRsc.push(req.url());
      }
    });

    await page.getByRole("link", { name: "View selected work" }).click();
    await expect(page).toHaveURL(/\/#selected-work$/);
    await page.waitForTimeout(300);
    expect(samePageRsc, samePageRsc.join("\n")).toEqual([]);
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
    ]);
    await expect(footer.getByText(/johnschibelli\.dev/)).toBeVisible();
    for (const name of ["LinkedIn", "Facebook", "Upwork", "Bluesky"]) {
      await expect(footer.getByRole("link", { name })).toBeVisible();
    }
  });

  test("mobile menu link order", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile hamburger only");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog", { name: "Atlas menu" });
    await expect(menu).toBeVisible();
    const navLinks = menu.locator("ul").first().getByRole("link");
    await expect(navLinks).toHaveCount(4);
    await expect(navLinks).toHaveText(["Work", "Articles", "About", "Contact"]);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto("/");
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
    await expect(page).toHaveScreenshot(`homepage-${testInfo.project.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("visual regression — mobile menu open", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile hamburger only");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: "Atlas menu" })).toBeVisible();
    await expect(page).toHaveScreenshot("homepage-mobile-menu-open.png", {
      fullPage: false,
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
