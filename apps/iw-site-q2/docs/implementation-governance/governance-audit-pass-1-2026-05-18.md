# Governance Audit — Pass 1 (2026-05-18)

**Scope:** `apps/iw-site-q2` within the Nexus monorepo  
**Mode:** Read-only audit (no code changes)  
**Authority:** Implementation Execution Contract v1.0 and governance files listed below

---

## Prerequisite: missing required reading

**Missing file:** `docs/implementation-governance/acceptable-inconsistency.md` is not in the repository. The contract index references it; `START-HERE.md` references `06-acceptable-inconsistency.md`, which also does not exist under `implementation-governance/`. Only `docs/doctrine/06-acceptable-inconsistency.md` exists (doctrine — not read per audit protocol).

The audit below used the other seven governance files plus the live codebase. Load-bearing inconsistency boundaries were inferred only from cross-references in those files, not from the missing document.

**Governance files read (in order):**

1. `START-HERE.md`
2. `implementation-execution-contract.md`
3. `QUICK-REFERENCE.md`
4. `01-forbidden-refactors.md`
5. `02-approved-abstractions.md`
6. `03-normalization-danger-signs.md`
7. `04-section-specific-warnings.md`

---

## Baseline finding

Governance describes a **Phase 1 scaffold** (`src/components/snapshots/SN-01.tsx` …). The app is a **built marketing site** using `components/` (no `src/`), no snapshot tree, and a different homepage section map than the contract’s Hero → Friction → Argument → Pillars → Proof → Model → Continuity → Filter → CTA.

**Current homepage** (`app/(site)/page.tsx`):

`HomeHero` → `Friction` → `Proof` → `Model` → `Fit` → `FinalCTA`

Missing from homepage: **Argument**, **Pillars**, **Continuity**, **Filter** (For / Not For).

---

# Document 1 — Violation Inventory

## Summary

| Category | Count |
|----------|------:|
| Total violations found | 53 |
| Critical (Contract Section 8/9) | 3 |
| Structural (architecture-level) | 28 |
| Drift indicators (Section 3 forbidden work) | 18 |
| Missing infrastructure (Section 15) | 4 |

## Critical violations

| # | File | Line(s) | Violation | Contract |
|---|------|---------|-----------|----------|
| 1 | `components/hero-diagram.tsx` | 8 | Type named `DiagramNode` | Section 8 |
| 2 | `components/hero-diagram.tsx` | 34, 130 | Uses `DiagramNode` in signatures | Section 8 |
| 3 | `components/hero-diagram.tsx` | 17, 49 | Graph `Edge` type (`from`/`to` node ids) in shared diagram | Section 8 (forbidden `DiagramEdge` pattern by function) |

## Structural violations

| # | File / location | Line(s) | Violation | Rule |
|---|-----------------|---------|-----------|------|
| 4 | Repository | — | `src/components/snapshots/` does not exist | C-01, C-02, C-03 |
| 5 | Repository | — | `SN-01.tsx` … `SN-07.tsx` absent | Section 2, 6, 12 |
| 6 | Repository | — | `SN-02.mobile.tsx`, `SN-05.mobile.tsx`, `SN-06.mobile.tsx` absent | C-04, Section 12 |
| 7 | Repository | — | `src/components/snapshots/_primitives/AnnotationLabel.tsx` absent | Section 5, 12 |
| 8 | Repository | — | `src/components/layout/SectionWrapper.tsx` absent | Section 5, C-05, 12 |
| 9 | Repository | — | `src/components/primitives/typography.tsx` absent (`components/primitives.tsx` differs) | Section 5, S-01 |
| 10 | Repository | — | `src/lib/geometry-math.ts` absent | Section 5, S-03, 12 |
| 11 | `components/hero-diagram.tsx` | — | Shared diagram renderer across sections | C-03 |
| 12 | `components/sections/fit-section.tsx` | 3 | Imports shared `HeroDiagram` | C-02, C-03 |
| 13 | `components/sections/hero.tsx` | 5 | Imports shared `HeroDiagram` (legacy; unused by homepage) | C-03 |
| 14 | `components/sections/proof-section.tsx` | 31–175 | Generic `Artifact` card ×3 | Section 3 |
| 15 | `components/sections/proof-section.tsx` | — | Card grid, not seven independent snapshots | C-03, Section 6 |
| 16 | `components/sections/proof/request-fulfillment-diagram.tsx` | 31–49 | `anchor()` algorithmic label placement | C-06, F-11 |
| 17 | `components/sections/proof/onboarding-process-diagram.tsx` | — | Unused diagram file (dead code) | S-01, C-06 risk |
| 18 | `components/sections/proof/monthly-reporting-diagram.tsx` | — | Unused diagram file (dead code) | S-01 |
| 19 | `app/(site)/page.tsx` | 19–24 | Omits Argument, Pillars, Continuity, Filter | Section 6, 04-section-specific-warnings |
| 20 | `app/(site)/page.tsx` | — | No Argument band | C-08 |
| 21 | `app/(site)/page.tsx` | — | No Filter section (For / Not For) | C-07 |
| 22 | `app/globals.css` | 73–79, 396–404 | Unified `--space-section-y` on `.marketing-slab` | C-05, F-07 |
| 23 | `components/primitives.tsx` | — | `Reveal`, `HeroRise`, `useInView`, `Btn`, etc. not approved | Section 5, S-01 |
| 24 | `components/section-label.tsx` | — | Shared component not on approved list | S-01 |
| 25 | `lib/section-seam.ts` | — | Shared gradient seam utility not approved | S-01 |
| 26 | `components/page-hero.tsx` | — | Shared page hero not approved | S-01 |
| 27 | `components/icons.tsx` | — | Shared icon system not approved | S-01 |
| 28 | `components/nav-bar.tsx`, `footer.tsx`, etc. | — | Additional shared UI not on approved list | S-01 |
| 29 | Repository | — | Phase 1 completion criteria (Section 12) overwhelmingly unmet | Section 12 |
| 30 | `eslint.config.mjs` | — | No snapshot import isolation rule | Section 15, C-01 |

**Section 14 (visual regression):** No snapshot visual regression tests found — **compliant** (nothing to flag).

**Section 8 (Hero alignment):** Live `home-hero.tsx` is left-weighted — **no violation** on current homepage hero.

**Section 9 (forbidden vocabulary in code):** No doctrine terms in `.tsx`/`.ts`/`.css` implementation files.

## Drift indicators

| # | File | Line(s) | Violation | Reference |
|---|------|---------|-----------|-----------|
| 32 | `components/sections/home-hero.tsx` | 27–35 | Hero photography (`/hero-01.png`) | 04-section-specific-warnings, Section 3 |
| 33 | `components/pages/about/about-page.tsx` | 58–66 | About hero photography | Same |
| 34 | `components/sections/friction-section.tsx` | 29–38, 80 | Lucide icon on every friction item | Friction section rules |
| 35 | `components/sections/friction-section.tsx` | 77 | `minHeight: 72` on cells (visual balancing) | Section 3, Friction |
| 36 | `lib/section-seam.ts` | 4–7 | Gradient hairline between sections | C-08-adjacent |
| 37 | `components/sections/friction-section.tsx` | 18–21, 217 | Multi-stop background gradients + seam | F-09-style |
| 38 | `components/sections/proof-section.tsx` | 13–16, 283–289 | Gradient surface + seam | F-09-style |
| 39 | `components/sections/model-section.tsx` | — | Dark styling without `rupture="argument-band"` | C-08 |
| 40 | `components/sections/hero.tsx` | 71–87, 144–250 | Entrance animations, orbs, pointer gradient | Section 3 |
| 41 | `components/primitives.tsx` | 17–88 | `IntersectionObserver` reveal + `HeroRise` | Section 3, S-07 |
| 42 | `app/globals.css` | 258–359, 567–620, 713–722, 908 | Global transitions and keyframes | Section 3 |
| 43 | `components/nav-bar.tsx` | 17–24, 146 | Scroll-driven nav + transition | Section 3, S-07 |
| 44 | `components/footer.tsx` | multiple | `hover:` / `transition-*` on links | Section 3 |
| 45 | `components/shared/website-intake-form.tsx` | multiple | hover/transition on controls | Section 3 |
| 46 | `components/sections/process.tsx` | 76, 96, 116 | height/opacity transitions | Section 3 |
| 47 | `components/sections/final-cta-section.tsx` | 100 | `transition-colors hover:` | Section 3 |
| 48 | `components/website-intake/KickoffScheduler.tsx` | multiple | hover/transition/`animate-spin` | Section 3 |
| 49 | `app/(site)/thank-you/page.tsx` | 51, 123 | hover/transition on buttons | Section 3 |

### Section 13 — Animation / transition inventory (representative)

| Surface | Mechanism | Files |
|---------|-----------|-------|
| Scroll reveal | `useInView` + opacity/transform transition | `primitives.tsx`, many section/page components using `Reveal` |
| Hero mount | `HeroRise` fade + rise | `primitives.tsx`, `hero.tsx`, `page-hero.tsx` |
| Global CSS | `@keyframes` (`reveal-up`, `orb-float`, `pulse-dot`, `nav-fade-in`, `page-hero-drift`, etc.) | `app/globals.css` |
| Nav | Scroll listener + `transition: all 280ms` | `nav-bar.tsx` |
| Hero (legacy) | `orb-float` animation, pointer radial gradient | `hero.tsx` |
| Diagram | RAF animation loop, SVG glow filter | `hero-diagram.tsx` |
| Process section | height/opacity/all transitions | `process.tsx` |
| Chrome / forms | `hover:` + `transition-colors` | `footer.tsx`, `website-intake-form.tsx`, `KickoffScheduler.tsx`, `thank-you/page.tsx` |
| Legal | `IntersectionObserver` for TOC | `legal-page-layout.tsx` |
| Intake | `window.scrollTo({ behavior: "smooth" })` | `website-intake-form.tsx` |

Some may be load-bearing for UX; the remediation plan decides keep vs. remove per contract.

## Missing infrastructure

| # | Item | Status | Contract |
|---|------|--------|----------|
| 50 | ESLint snapshot-to-snapshot import rule | **Missing** | Section 2, 15, C-01 |
| 51 | Commit scanner for forbidden vocabulary | **Missing** | Section 2, 15 |
| 52 | CODEOWNERS for snapshots/sections/layout | **Missing** | Section 2, 15 |
| 53 | PR template with governance justification | **Missing** | Section 2, 15 |

## Files inspected

**Governance:** All seven files listed in the prerequisite section.

**Application source:** All 83 `.ts`/`.tsx` files under `apps/iw-site-q2` (`app/**`, `components/**`, `lib/**`).

**Styles / config:** `app/globals.css`, `eslint.config.mjs`, `next.config.mjs`, `postcss.config.mjs`, `package.json`, `components/pages/about/about-reference.css`.

## Files NOT inspected

| Path | Reason |
|------|--------|
| `docs/implementation-governance/acceptable-inconsistency.md` | Missing from repository |
| `public/*.{png,jpg,svg}` | Binary; referenced only from TSX/CSS |
| `intraweb-tech-website/**` | Legacy prototype; ESLint-ignored; not wired to App Router homepage |
| `tmp/**`, `docs/doctrine/**` | Out of audit scope per protocol |
| Monorepo packages outside `iw-site-q2` | Out of homepage implementation scope |

---

# Document 2 — Remediation Plan

## Sequencing principle

Resolve governance documentation gaps and mechanical enforcement first so later refactors cannot merge unchecked. Then scaffold the contract’s directory layout and stubs without touching live UX. Only after operator approval of section mapping should bounded migrations run: shared diagram removal, proof snapshot introduction, section shells, then drift stripping (motion/gradients/imagery) in smallest reviewable slices. Homepage sections that do not exist yet (Argument, Filter) require explicit product decisions before implementation.

---

## Unit 1 — Restore missing governance artifact

- **Violations addressed:** Prerequisite stop (missing `acceptable-inconsistency.md`)
- **Files touched:** `docs/implementation-governance/acceptable-inconsistency.md` (or rename/link per operator)
- **Estimated commits:** 1
- **Risk:** low
- **Dependencies:** none
- **Approval needed before execution:** yes

## Unit 2 — Mechanical enforcement layer

- **Violations addressed:** 50–53
- **Files touched:** `eslint.config.mjs`, commit-scanner script + hook, `.github/CODEOWNERS`, `.github/pull_request_template.md`
- **Estimated commits:** 2–3
- **Risk:** medium
- **Dependencies:** Unit 1
- **Approval needed before execution:** yes

## Unit 3 — Phase 1 directory scaffold (no UX change)

- **Violations addressed:** 4–10, 29 (partial)
- **Files touched:** `src/components/snapshots/SN-01.tsx` … `SN-07.tsx`, mobile stubs, `_primitives/AnnotationLabel.tsx`, `src/components/layout/SectionWrapper.tsx`, `src/components/primitives/typography.tsx`, `src/lib/geometry-math.ts`, Tailwind token config
- **Estimated commits:** 1–2
- **Risk:** low
- **Dependencies:** Unit 2
- **Approval needed before execution:** yes

## Unit 4 — Path strategy decision (no code until approved)

- **Violations addressed:** 9, 23–28 (strategy only)
- **Files touched:** none — written decision: migrate `components/` → `src/components/` vs. amend contract paths
- **Estimated commits:** 0
- **Risk:** high if skipped
- **Dependencies:** Unit 1
- **Approval needed before execution:** yes

## Unit 5 — Rename/remove forbidden diagram vocabulary

- **Violations addressed:** 1–3, 11–13
- **Files touched:** `components/hero-diagram.tsx`, `components/sections/fit-section.tsx`, `components/sections/hero.tsx`
- **Estimated commits:** 1
- **Risk:** medium
- **Dependencies:** Unit 4
- **Approval needed before execution:** yes

## Unit 6 — Retire or quarantine unused proof diagram files

- **Violations addressed:** 16–18
- **Files touched:** `components/sections/proof/*.tsx`
- **Estimated commits:** 1
- **Risk:** low
- **Dependencies:** Unit 5
- **Approval needed before execution:** yes

## Unit 7 — Homepage section map: add missing shells

- **Violations addressed:** 19–21
- **Files touched:** `app/(site)/page.tsx`, new Argument/Filter (and optional Pillars/Continuity) stubs
- **Estimated commits:** 2–4
- **Risk:** high
- **Dependencies:** Units 3–4
- **Approval needed before execution:** yes

## Unit 8 — Argument band hard boundary

- **Violations addressed:** 20, 36–39 (argument-specific)
- **Files touched:** Argument section, `SectionWrapper` `rupture` prop, remove gradient seams at band edges
- **Estimated commits:** 1–2
- **Risk:** high
- **Dependencies:** Unit 7
- **Approval needed before execution:** yes

## Unit 9 — Filter section column asymmetry

- **Violations addressed:** 21, C-07
- **Files touched:** New Filter section (separate column components; no shared `FilterColumn`)
- **Estimated commits:** 2
- **Risk:** medium
- **Dependencies:** Unit 7
- **Approval needed before execution:** yes

## Unit 10 — Proof section: SN-01–SN-07

- **Violations addressed:** 14–15, 4–6 (implementation)
- **Files touched:** `proof-section.tsx`, `src/components/snapshots/SN-*.tsx`, mobile files for SN-02/05/06
- **Estimated commits:** 7+ (one snapshot per commit)
- **Risk:** high
- **Dependencies:** Units 3, 5, 6
- **Approval needed before execution:** yes

## Unit 11 — Section spacing token migration

- **Violations addressed:** 22
- **Files touched:** `SectionWrapper.tsx`, `app/globals.css`, each section file
- **Estimated commits:** 3–5 (one section per commit)
- **Risk:** medium
- **Dependencies:** Unit 3
- **Approval needed before execution:** yes

## Unit 12 — Friction section authored properties

- **Violations addressed:** 34–35
- **Files touched:** `friction-section.tsx`
- **Estimated commits:** 1
- **Risk:** medium
- **Dependencies:** Unit 11
- **Approval needed before execution:** yes

## Unit 13 — Hero environmental compliance

- **Violations addressed:** 32
- **Files touched:** `home-hero.tsx`, related `public/` assets
- **Estimated commits:** 1–2
- **Risk:** medium
- **Dependencies:** Unit 4
- **Approval needed before execution:** yes

## Unit 14 — Motion and hover stripping (bounded)

- **Violations addressed:** 40–49 and Section 13 inventory
- **Files touched:** `primitives.tsx`, `globals.css`, `nav-bar.tsx`, `footer.tsx`, forms, legacy `hero.tsx`
- **Estimated commits:** 4–6
- **Risk:** medium
- **Dependencies:** Units 4–5
- **Approval needed before execution:** yes

## Unit 15 — Unauthorized shared component audit closure

- **Violations addressed:** 23–28
- **Files touched:** TBD per Unit 4
- **Estimated commits:** TBD
- **Risk:** high
- **Dependencies:** Units 4, 10–14
- **Approval needed before execution:** yes

## Unit 16 — About page (scope TBD)

- **Violations addressed:** 33, about-specific drift
- **Files touched:** `about-page.tsx`, `about-reference.css`, `public/*`
- **Estimated commits:** 2+
- **Risk:** medium
- **Dependencies:** Operator scope confirmation
- **Approval needed before execution:** yes

---

## Open questions for the operator

1. Should contract `src/` paths be created as specified, or should governance be amended to match existing `components/` layout?
2. Is the retrofit goal to preserve current live homepage UX while converging architecture, or replace with Phase 1 shells and rebuild section-by-section?
3. Where should Argument band and Filter section live in current IA?
4. Should `hero-diagram.tsx` be deleted, inlined into one section, or re-authored as a future SN-xx snapshot?
5. Is `components/sections/hero.tsx` (unused by homepage) in scope for deletion?
6. Should `acceptable-inconsistency.md` be copied from doctrine, or written fresh for implementation tone?
7. Is the About page rebuild in scope for this retrofit or excluded?
8. Should `intraweb-tech-website/` be removed or archived?

## Decisions made during audit

1. Audited `apps/iw-site-q2` as the implementation app.
2. Mapped contract paths `src/components/...` to actual `components/...` and recorded path mismatch as structural debt.
3. Treated missing homepage sections (Argument, Filter) as structural absence, not pass.
4. Live homepage hero (`home-hero.tsx`) assessed for alignment rules; legacy `hero.tsx` flagged separately.
5. No visual regression tests present — compliant for S-06.
6. Continued audit despite missing `acceptable-inconsistency.md`, with explicit stop noted above.

---

## Next step

Review this inventory against the contract. Approve, modify, or re-sequence remediation units before any execution. **No remediation units are authorized until explicitly approved.**
