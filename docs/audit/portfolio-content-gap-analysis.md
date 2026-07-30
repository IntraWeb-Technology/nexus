# Portfolio OS — content gap analysis

**Repo:** `C:\Users\jschi\OneDrive\Desktop\Projects\2025_portfolio\portfolio-os`  
**Date:** 2026-07-30  

## Content model (active)

| Concern | Source of truth |
| --- | --- |
| Project listing / details | Typed modules: `apps/site/data/projects/*.ts` via `index.ts` |
| Project type | `apps/site/data/projects/types.ts` (`ProjectMeta`) |
| Case study details | Local gray-matter + Markdown under `apps/site/content/case-studies/*.mdx` |
| Case study listing | **Hard-coded array** in `apps/site/app/case-studies/page.tsx` (must update separately) |
| Legacy | `portfolio.json`, `case-studies.json` — not driving `/projects` |

## Current IntraWeb record

File: `apps/site/data/projects/intraweb.ts`

| Field | Current (problem) | Audit-backed direction |
| --- | --- | --- |
| title | “Intraweb Technologies Company Website” | Position as **IntraWeb Nexus** (ops + portal + automation), not only marketing site |
| published | `false` | Publish only after case study + details content exist |
| caseStudyUrl | `/case-studies/intraweb` | **Broken** — no MDX file |
| technologies | Includes Prisma | Portal uses **Supabase**, not Prisma |
| status | `completed` | Better: `in-progress` or `production-ready` with partial roadmap honesty |
| overview/challenge/solution | Missing | Required for details page richness (see Portfolio OS project) |
| liveUrl | intrawebtech.com | Keep marketing; optionally document portal as authenticated (do not invent public portal URL if gated) |

**Nexus** is not present as a separate project slug — recommend **updating the IntraWeb project** to represent the platform rather than creating a competing card.

## Design-regression risks

1. Publishing IntraWeb changes `/projects` from **single featured horizontal card** to **multi-card grid** — intentional layout shift; verify visually.
2. Broken case-study CTA if MDX + listing entry not added together.
3. Tendril listing slug mismatch (`tendrilo-case-study` vs `tendril.mdx`) is a **pre-existing** defect — fix only if blocking this initiative.
4. Long copy/tags can change card heights — keep description concise.
5. Dynamic project OG image currently returns `null` — pre-existing; do not expand scope unless needed.
6. Unsplash images OK (allowlisted); prefer consistent aspect-video assets.

## Safe change plan

1. Expand `intraweb.ts` with accurate `ProjectMeta` narrative fields (no design changes).
2. Add `apps/site/content/case-studies/intraweb.mdx` using Portfolio OS / Tendril frontmatter patterns — **no invented metrics**.
3. Add IntraWeb entry to hard-coded `case-studies/page.tsx` array.
4. Optionally sync shortened narrative into Nexus `docs/portfolio/` for engineering audience.
5. Preserve components: `animated-project-card`, `project-header`, `project-content`, etc.

## Portfolio readiness (pre-implementation assessment)

| Presentation mode | Fit |
| --- | --- |
| Flagship case study | **Conditional** — strong architecture, but outbound automation orphans, social-ops experimental, and security findings require honest framing |
| Supporting / flagship-with-caveats | **Best fit** — “production core live; automation catalog curated; some paths partial” |
| MVP / experimental only | Too weak — core portal and admin are beyond MVP |
