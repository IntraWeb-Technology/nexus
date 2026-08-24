import type { Page } from "@playwright/test";

/**
 * Scroll pending motion reveals into view so axe does not sample
 * mid-animation / opacity-0 content as low-contrast text.
 */
export async function settleMotionReveals(page: Page) {
  await page.evaluate(async () => {
    const selector =
      '.atlas-reveal[data-phase="pending"], .atlas-evidence-item[data-phase="pending"]';
    const nodes = Array.from(document.querySelectorAll(selector));
    for (const node of nodes) {
      node.scrollIntoView({ block: "center", inline: "nearest" });
      await new Promise((resolve) => window.setTimeout(resolve, 220));
    }
    window.scrollTo({ top: 0, left: 0 });
  });
  await page
    .locator(
      '.atlas-reveal[data-phase="pending"], .atlas-evidence-item[data-phase="pending"]',
    )
    .first()
    .waitFor({ state: "detached", timeout: 5000 })
    .catch(() => undefined);
}
