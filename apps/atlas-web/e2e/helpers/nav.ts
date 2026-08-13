import { expect, type Page } from "@playwright/test";

/**
 * Assert aria-current on a primary nav link.
 * On mobile the desktop link list is hidden — open the hamburger menu first.
 */
export async function expectCurrentNavLink(
  page: Page,
  label: string,
  projectName: string,
) {
  if (projectName === "mobile") {
    await page.setViewportSize({ width: 390, height: 844 });
    const open = page.getByRole("button", { name: "Open menu" });
    if (await open.isVisible()) {
      await open.click();
    }
    await expect(
      page.getByRole("dialog", { name: "Atlas menu" }).getByRole("link", {
        name: label,
        exact: true,
      }),
    ).toHaveAttribute("aria-current", "page");
    return;
  }

  await expect(
    page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: label, exact: true }),
  ).toHaveAttribute("aria-current", "page");
}

/**
 * Click a primary nav destination (opens mobile menu when needed).
 */
export async function clickPrimaryNavLink(
  page: Page,
  label: string,
  projectName: string,
) {
  if (projectName === "mobile") {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .getByRole("dialog", { name: "Atlas menu" })
      .getByRole("link", { name: label, exact: true })
      .click();
    return;
  }

  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: label, exact: true })
    .first()
    .click();
}
