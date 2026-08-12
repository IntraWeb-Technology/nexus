/**
 * Targeted M7 evidence crops — avoid empty media planes as the subject.
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(__dirname, "../public/_capture-source");
const imgRoot = path.join(__dirname, "../public/images");
const base = process.env.ATLAS_BASE_URL ?? "http://127.0.0.1:3020";

async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
}

async function clipShot(page, file, locator) {
  const el = typeof locator === "string" ? page.locator(locator).first() : locator;
  await el.scrollIntoViewIfNeeded();
  await settle(page);
  const box = await el.boundingBox();
  if (!box) throw new Error(`No box for ${file}`);
  const vp = page.viewportSize();
  const clip = {
    x: Math.max(0, Math.floor(box.x)),
    y: Math.max(0, Math.floor(box.y)),
    width: Math.min(vp.width - Math.max(0, Math.floor(box.x)), Math.ceil(box.width)),
    height: Math.min(Math.ceil(box.height), Math.floor(vp.height * 0.9)),
  };
  if (clip.width < 40 || clip.height < 40) throw new Error(`Tiny clip ${file}`);
  await page.screenshot({
    path: path.join(srcRoot, `${file}.png`),
    clip,
    animations: "disabled",
    caret: "hide",
  });
}

function toWebp(inputPng, outputWebp, maxW) {
  const args = ["-y", "-i", inputPng];
  if (maxW) args.push("-vf", `scale=${maxW}:-1`);
  args.push("-c:v", "libwebp", "-quality", "82", outputWebp);
  execFileSync("ffmpeg", args, { stdio: "pipe" });
}

async function run() {
  await mkdir(srcRoot, { recursive: true });
  await mkdir(path.join(imgRoot, "case-studies/portfolio-os"), { recursive: true });
  await mkdir(path.join(imgRoot, "work"), { recursive: true });
  await mkdir(path.join(imgRoot, "docs"), { recursive: true });
  await mkdir(path.join(__dirname, "../public/og"), { recursive: true });

  const browser = await chromium.launch({
    args: ["--font-render-hinting=none", "--disable-lcd-text"],
  });

  // Desktop 1440 @2x
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();

    await page.goto(`${base}/work/portfolio-os`, { waitUntil: "networkidle" });
    await settle(page);

    // Case header only (chapter + title + deck + meta) — application framing without empty figure
    await clipShot(
      page,
      "evidence-case-header-desktop",
      page.locator("main section").first(),
    );

    // Overview evidence columns
    await clipShot(page, "evidence-case-overview-desktop", "#overview");

    // Architecture composed diagram
    await clipShot(page, "evidence-case-architecture-desktop", "#architecture");

    // Decisions — editorial micro-hierarchy
    await clipShot(page, "evidence-case-decisions-desktop", "#decisions");

    // Implementation chapter chrome only (heading block before figures)
    await page.locator("#implementation").scrollIntoViewIfNeeded();
    await settle(page);
    const implHeader = page.locator("#implementation > div").first();
    await clipShot(page, "evidence-case-impl-header-desktop", implHeader);

    await page.goto(`${base}/work`, { waitUntil: "networkidle" });
    await settle(page);
    await clipShot(page, "evidence-work-intro-desktop", page.locator("main section").first());
    // Featured copy band without the ink plane: chapter + title + summary row
    const featuredHead = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Portfolio OS", exact: true }),
    }).first().locator("> div").first();
    await clipShot(page, "evidence-work-featured-copy-desktop", featuredHead);

    await page.goto(`${base}/`, { waitUntil: "networkidle" });
    await settle(page);
    // Hero copy field only (right column)
    const heroCopy = page.locator("main section").first().locator("> div").nth(1);
    await clipShot(page, "evidence-home-hero-copy-desktop", heroCopy);
    // Philosophy composed diagram
    await clipShot(
      page,
      "evidence-home-philosophy-desktop",
      page.locator("section").filter({
        has: page.getByText("ENGINEERING PHILOSOPHY"),
      }),
    );

    await page.goto(`${base}/docs`, { waitUntil: "networkidle" });
    await settle(page);
    await clipShot(page, "evidence-docs-landing-desktop", "main");

    await page.goto(`${base}/about`, { waitUntil: "networkidle" });
    await settle(page);
    await clipShot(
      page,
      "evidence-about-approach-desktop",
      page.locator("section").filter({ has: page.getByText("APPROACH") }).first(),
    );

    await context.close();
  }

  // Tablet / mobile product crops
  for (const [name, vp] of [
    ["tablet", { width: 768, height: 1024 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const context = await browser.newContext({
      viewport: vp,
      deviceScaleFactor: 2,
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();

    await page.goto(`${base}/work/portfolio-os`, { waitUntil: "networkidle" });
    await settle(page);
    await clipShot(page, `evidence-case-header-${name}`, page.locator("main section").first());
    await clipShot(page, `evidence-case-overview-${name}`, "#overview");

    await page.goto(`${base}/docs`, { waitUntil: "networkidle" });
    await settle(page);
    await page.screenshot({
      path: path.join(srcRoot, `evidence-docs-landing-${name}.png`),
      animations: "disabled",
      caret: "hide",
    });

    await page.goto(`${base}/`, { waitUntil: "networkidle" });
    await settle(page);
    await page.screenshot({
      path: path.join(srcRoot, `evidence-home-viewport-${name}.png`),
      animations: "disabled",
      caret: "hide",
    });

    await context.close();
  }

  // OG PNG from SVG via Chromium
  {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const ogSvg = path.join(__dirname, "../public/og/default.svg");
    await page.goto(`file://${ogSvg}`);
    await page.screenshot({
      path: path.join(__dirname, "../public/og/default.png"),
      type: "png",
      animations: "disabled",
    });
    await context.close();
  }

  await browser.close();

  // Optimize runtime webps from evidence crops
  const map = [
    // A-01 home hero — case header as "what is built"
    ["evidence-case-header-desktop.png", "case-studies/portfolio-os/portfolio-os-home-hero-desktop.webp", 1760],
    ["evidence-case-header-tablet.png", "case-studies/portfolio-os/portfolio-os-home-hero-tablet.webp", 1536],
    ["evidence-case-header-mobile.png", "case-studies/portfolio-os/portfolio-os-home-hero-mobile.webp", 780],
    // A-02 / PA-HF — overview as flagship proof (different crop family)
    ["evidence-case-overview-desktop.png", "case-studies/portfolio-os/portfolio-os-work-featured-desktop.webp", 2400],
    ["evidence-case-overview-tablet.png", "case-studies/portfolio-os/portfolio-os-work-featured-compact.webp", 1536],
    ["evidence-case-overview-desktop.png", "case-studies/portfolio-os/portfolio-os-home-featured-desktop.webp", 2400],
    // A-06 case hero — decisions/editorial surface (not empty panels)
    ["evidence-case-decisions-desktop.png", "case-studies/portfolio-os/portfolio-os-case-hero-desktop.webp", 2400],
    ["evidence-case-overview-tablet.png", "case-studies/portfolio-os/portfolio-os-case-hero-tablet.webp", 1536],
    ["evidence-case-overview-mobile.png", "case-studies/portfolio-os/portfolio-os-case-hero-mobile.webp", 780],
    // PA-CS3 brand / homepage implementation — docs handbook + home philosophy
    ["evidence-docs-landing-desktop.png", "case-studies/portfolio-os/portfolio-os-case-implementation-desktop.webp", 1680],
    ["evidence-docs-landing-tablet.png", "case-studies/portfolio-os/portfolio-os-case-implementation-tablet.webp", 1536],
    ["evidence-docs-landing-mobile.png", "case-studies/portfolio-os/portfolio-os-case-implementation-mobile.webp", 780],
    // PA-CS4 micro hierarchy
    ["evidence-case-impl-header-desktop.png", "case-studies/portfolio-os/portfolio-os-case-ui-closeup.webp", 1120],
    // A-12 docs
    ["evidence-docs-landing-desktop.png", "docs/atlas-docs-handbook-desktop.webp", 1680],
  ];

  for (const [src, dest, maxW] of map) {
    toWebp(path.join(srcRoot, src), path.join(imgRoot, dest), maxW);
  }

  console.log("Evidence crops + webp optimization complete");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
