/**
 * M7 Portfolio OS capture family — deterministic production screenshots.
 * Run against `pnpm start` on port 3020 with fonts loaded and no overlays.
 *
 * Usage: node scripts/capture-m7-assets.mjs
 */
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outRoot = path.join(__dirname, "../public/_capture-source");
const base = process.env.ATLAS_BASE_URL ?? "http://127.0.0.1:3020";

const viewports = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
};

async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    document
      .querySelectorAll("[data-nextjs-toast], nextjs-portal")
      .forEach((el) => el.remove());
  });
}

async function shot(page, name, clip) {
  const file = path.join(outRoot, `${name}.png`);
  await page.screenshot({
    path: file,
    clip,
    animations: "disabled",
    caret: "hide",
  });
  return file;
}

async function full(page, name) {
  const file = path.join(outRoot, `${name}.png`);
  await page.screenshot({
    path: file,
    fullPage: false,
    animations: "disabled",
    caret: "hide",
  });
  return file;
}

async function run() {
  await mkdir(outRoot, { recursive: true });
  const browser = await chromium.launch({
    args: ["--font-render-hinting=none", "--disable-lcd-text"],
  });

  const captures = [];

  for (const [vpName, vp] of Object.entries(viewports)) {
    const context = await browser.newContext({
      viewport: vp,
      deviceScaleFactor: 2,
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();

    // Case study — primary Portfolio OS product surface
    await page.goto(`${base}/work/portfolio-os`, { waitUntil: "networkidle" });
    await settle(page);
    captures.push(await full(page, `portfolio-os-case-${vpName}`));

    // Crop hero band (below nav)
    const hero = await page.locator("main").boundingBox();
    if (hero) {
      const clipH = Math.min(vp.height - 60, Math.floor(vp.height * 0.72));
      captures.push(
        await shot(page, `portfolio-os-case-hero-band-${vpName}`, {
          x: 0,
          y: 56,
          width: vp.width,
          height: clipH,
        }),
      );
    }

    // Architecture section evidence
    const arch = page.locator("#architecture");
    if (await arch.count()) {
      await arch.scrollIntoViewIfNeeded();
      await settle(page);
      const box = await arch.boundingBox();
      if (box) {
        captures.push(
          await shot(page, `portfolio-os-architecture-section-${vpName}`, {
            x: Math.max(0, box.x),
            y: Math.max(0, box.y),
            width: Math.min(vp.width, box.width),
            height: Math.min(720, box.height),
          }),
        );
      }
    }

    // Implementation chapter marker close-up (PA-CS4)
    const impl = page.locator("#implementation");
    if (await impl.count()) {
      await impl.scrollIntoViewIfNeeded();
      await settle(page);
      const box = await impl.boundingBox();
      if (box) {
        captures.push(
          await shot(page, `portfolio-os-chapter-hierarchy-${vpName}`, {
            x: Math.max(0, box.x),
            y: Math.max(0, box.y),
            width: Math.min(vp.width, Math.max(320, box.width * 0.55)),
            height: Math.min(280, box.height),
          }),
        );
      }
    }

    // Work index — flagship framing
    await page.goto(`${base}/work`, { waitUntil: "networkidle" });
    await settle(page);
    captures.push(await full(page, `work-index-${vpName}`));
    captures.push(
      await shot(page, `work-featured-band-${vpName}`, {
        x: 0,
        y: 56,
        width: vp.width,
        height: Math.min(vp.height - 56, Math.floor(vp.height * 0.78)),
      }),
    );

    // Homepage — brand system / implementation evidence (PA-CS3)
    await page.goto(`${base}/`, { waitUntil: "networkidle" });
    await settle(page);
    captures.push(await full(page, `home-viewport-${vpName}`));

    const philosophy = page.getByRole("heading", {
      name: /Systems should make/i,
    });
    if (await philosophy.count()) {
      await philosophy.scrollIntoViewIfNeeded();
      await settle(page);
    }

    // Featured case block for alternate crop
    const featured = page.getByRole("heading", {
      level: 2,
      name: "Portfolio OS",
    });
    if (await featured.count()) {
      await featured.scrollIntoViewIfNeeded();
      await settle(page);
      const section = page.locator("section").filter({ has: featured }).first();
      const box = await section.boundingBox();
      if (box) {
        captures.push(
          await shot(page, `home-featured-section-${vpName}`, {
            x: Math.max(0, box.x),
            y: Math.max(0, box.y),
            width: Math.min(vp.width, box.width),
            height: Math.min(640, box.height),
          }),
        );
      }
    }

    // Docs landing — optional A-12 source
    await page.goto(`${base}/docs`, { waitUntil: "networkidle" });
    await settle(page);
    captures.push(await full(page, `docs-handbook-${vpName}`));

    await context.close();
  }

  await writeFile(
    path.join(outRoot, "manifest.json"),
    JSON.stringify({ base, capturedAt: new Date().toISOString(), captures }, null, 2),
  );
  await browser.close();
  console.log(`Captured ${captures.length} frames → ${outRoot}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
