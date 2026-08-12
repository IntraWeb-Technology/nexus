# Atlas production assets (M7)

## Layout

```text
apps/atlas-web/public/
  favicon.svg
  og/default.png
  images/
    brand/atlas-mark.svg
    work/
      shared-strapi-architecture.svg
      intraweb-automation-workflow.svg
    case-studies/portfolio-os/
      portfolio-os-*.webp
    docs/
      atlas-docs-handbook-desktop.webp
    articles/   # reserved for CMS-bound article rasters
```

## Naming

`{subject}-{role}-{viewport?}.{ext}`

Examples:

- `portfolio-os-home-hero-desktop.webp`
- `shared-strapi-architecture.svg`
- `intraweb-automation-workflow.svg`

Avoid: `image1.png`, `Screenshot 2026…png`, `final-final.png`.

## Formats

| Kind | Format |
| --- | --- |
| Product screenshots | WebP |
| Diagrams (crisp geometry) | SVG or composed React UI |
| Default OG | PNG 1200×630 |
| Favicon / mark | SVG |

## Capture regeneration

Source frames (gitignored): `.m7-capture/`

```bash
pnpm build && pnpm start
node scripts/capture-m7-assets.mjs
node scripts/optimize-m7-assets.mjs
```

## Ownership

| Asset class | Runtime now | Future owner |
| --- | --- | --- |
| Favicon / mark / default OG | `public/` static | Application |
| Project / case / article / docs rasters | `public/images` static | Strapi (M8) |
| Architecture / workflow diagrams | Composed UI or SVG | Application (composed) or Strapi if CMS authors own them |

## Deferred (non-blocking)

| ID | Asset | Status | Reason |
| --- | --- | --- | --- |
| A-05 | Vehicle Maintenance selected media | **DEFERRED / NON-BLOCKING** | No approved production source in Nexus. Do not manufacture substitute evidence. Project remains; no media plane. |

See `apps/atlas-docs/content/architecture/production-assets.mdx` for the full A-01–A-15 matrix and Freeze verdict.
