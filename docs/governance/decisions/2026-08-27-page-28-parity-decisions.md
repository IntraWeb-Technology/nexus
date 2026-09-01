# Page 28 parity decisions

**Kind:** Human engineering-authority decision record. Not an exception or waiver. Keep [`docs/governance/exceptions.md`](../exceptions.md) unchanged.

This record does **not** implement corrections, approve visual baselines, or authorize snapshot replacement, visual CI, CMS writes, or production deployment.

## 1. Decision metadata

| Field | Record |
| --- | --- |
| **Owner** | John Schibelli (Atlas Governance V1 product and release owner) |
| **Effective date** | 2026-08-27 |
| **Related authority** | Phase 2E-3A Story-First / Page 28 design-authority supersession in [`docs/governance/authority-map.md`](../authority-map.md) and [`apps/atlas-docs/content/architecture/build-manifest.mdx`](../../../apps/atlas-docs/content/architecture/build-manifest.mdx) |
| **Evidence** | Phase 2E-4A read-only Page 28 visual-parity review (compare-only actuals at commit `26e950d52b8e981310b24ed9d7e03c252179ce7a`; Figma inspected live) |
| **Figma file** | Atlas Design System `6r1KqLmwiB8TUXjyedezom` |
| **Figma page** | `616:2` — 28 — Story-First Redesign (Proposal) |

### Route and chrome frames used in Phase 2E-4A

| Surface | Desktop 1440 | Tablet 768 | Mobile 390 |
| --- | --- | --- | --- |
| Home (`/`) | `616:11` | `632:2` | `616:18` |
| Work index (`/work`) | `616:12` | `632:3` | `616:19` |
| Portfolio OS (`/work/portfolio-os`) | `616:13` | `632:4` | `632:9` |
| Articles index (`/articles`) | `616:14` | `632:5` | `632:10` |
| Contact (`/contact`) | `616:17` | `632:8` | `632:13` |

Shared chrome (Page 28 section `705:2`):

| Node | Name |
| --- | --- |
| `705:4` | Desktop Nav / Default |
| `705:15` | Tablet Nav / Default |
| `705:26` | Mobile Nav / Closed |
| `705:33` | Mobile Nav / Open Menu |
| `705:47` | Desktop Nav / Active Page |
| `705:58` | Footer / Desktop |
| `705:67` | Chrome Note Body (reuse nav/footer; mobile open uses Contact’s warm editorial surface, not an app-style drawer) |

## 2. Approved decision package

These decisions interpret Page 28 for implementation and later review. They do **not** certify that the current implementation already matches Page 28.

### Implementation corrections

Apply Phase 2E-4A corrections **C1–C8**. Add **C9** (tablet footer wrapping/crowding) before any baseline approval.

### Responsive interpretation

- Home mobile follows Page 28’s abbreviated composition (`616:18`) and **omits the Writing section**.
- Articles tablet/mobile omit the fifth Turborepo card (`632:5`, `632:10`).
- Work tablet/mobile use Page 28’s reduced CTA density (`632:3`, `616:19`).
- Articles Topics and CONTINUE elements are **not** accepted additions and **must be removed**.

### Media

- Home production photography is accepted as the **final media direction**, subject to Page 28 crop, placement, and responsive parity (`616:11`, `632:2`, `616:18`).
- The Articles cover photograph is accepted as the **final replacement** for the COVER placeholder, subject to crop and placement parity (`616:14` and related COVER nodes).
- The live Portfolio OS schematic is accepted as the **final replacement** for the DIAGRAM placeholder (`616:13` Under the Hood / related DIAGRAM nodes).
- Work gradient PHOTO tiles are **rejected as final media**. They may remain temporarily. **Work is blocked from baseline approval** until final imagery is supplied and approved.

### Viewport policy

- **Retain V1 §7.3.**
- Permanent visual coverage must include widths **1440, 1024, 768, and 390**.
- Targeted breakpoint evidence must cover **767/769** and **1439/1441**.
- Full stored visual baselines are **not** required at all four boundary widths unless the changed task affects the corresponding breakpoint.
- Canonical viewport values must eventually live in **one versioned repository location**.

This policy is **decided**, not implemented. Playwright still uses 1440 / 768 / 390. No canonical viewport file exists yet.

## 3. Correction backlog

| ID | Decision | Figma | Notes |
| --- | --- | --- | --- |
| **C1** | Home mobile open menu uses warm paper, not inverse ink-blue | `705:33`, `705:67` | Smallest next implementation task. Do not apply inverse/`ink-blue` to the Home open-menu surface. |
| **C2** | Remove Articles Topics and CONTINUE | `616:14`, `632:5`, `632:10` | Not accepted Story-First additions. |
| **C3** | Tablet Home uses photo-then-copy and one CTA | `632:2` | Media first; omit the secondary “Read the notes” CTA on tablet. |
| **C4** | Tablet Portfolio OS stacks Overview | `632:4` | Do not keep desktop three-column Overview at 768. |
| **C5** | Restore Contact invitation body copy | `616:17`, `632:8`, `632:13` | Match Page 28 invitation copy, not the current CMS/automation rewrite. |
| **C6** | Use title-case Contact field labels | `616:17` | Example: `Name`, `Email` — not `NAME`, `EMAIL`. |
| **C7** | Home writing title is “Why We Chose React Server Components.” | `616:11` (`622:23`) | Do not shorten to “Why We Chose RSC” on Home. |
| **C8** | Use rust-filled primary Home CTA and omit “Read the notes” on tablet | `616:11`, `632:2` | Desktop retains both CTAs with rust-filled primary; tablet is one CTA. |
| **C9** | Correct tablet footer wrapping/crowding | `705:58` reused at tablet | Required before baseline approval. |

C1–C9 remain **open**. This record does not implement them.

## 4. Media decisions and Work baseline blocker

| Surface | Decision | Baseline implication |
| --- | --- | --- |
| Home photography | Accepted as final media **direction**, subject to crop, placement, and responsive parity with Page 28 | Not a baseline approval of current Home captures |
| Articles cover photograph | Accepted as final replacement for the COVER placeholder, subject to crop and placement parity | Not a baseline approval of current Articles captures |
| Portfolio OS live schematic | Accepted as final replacement for the DIAGRAM placeholder | Not a baseline approval of current Portfolio OS captures |
| Work gradient PHOTO tiles | **Rejected** as final media; may remain temporarily | **Work is blocked from baseline approval** until final imagery is supplied and approved |

Do not generate, replace, or source Work imagery in a documentation task. Temporary PHOTO tiles must not be promoted to production-final or baseline-final status.

## 5. Responsive-content decisions

| Surface | Viewport | Required composition |
| --- | --- | --- |
| Home | Mobile (`616:18`) | Abbreviated Page 28 composition; **omit Writing** |
| Home | Tablet (`632:2`) | Photo-then-copy; **one** CTA (see C3 / C8) |
| Articles | Tablet / mobile | **Omit** the fifth Turborepo card |
| Articles | All in-scope viewports | **Remove** Topics chips and CONTINUE cue |
| Work | Tablet / mobile | Page 28 **reduced CTA density** |

Desktop Home retains Latest writing. Desktop Articles retains the five “More writing” cards including Turborepo (`616:14`). Desktop Work retains the denser CTA treatment (`616:12`).

## 6. Viewport policy decision

V1 §7.3 is retained. Named Figma frames remain 1440 / 768 / 390; repository visual proof must also cover **1024-pixel width**.

| Requirement | Status |
| --- | --- |
| Permanent visual coverage at 1440, 1024, 768, 390 | **Decided; not implemented** |
| Breakpoint evidence at 767/769 and 1439/1441 | **Decided; not implemented** |
| Full stored baselines at every boundary width | **Not required** unless the changed task affects that breakpoint |
| One versioned canonical viewport location | **Required; still missing** |
| Current Playwright projects | Still 1440×900, 768×1024, 390×844 — **not** the implemented control |

768-pixel tablet width is **not** a substitute for 1024-pixel width. Deciding this policy does **not** implement the control, update Playwright, or approve any snapshot.

## 7. Explicit non-approvals and remaining release blockers

These decisions do **not** approve:

- any existing Windows or Linux snapshot;
- current implementation parity;
- Work gradient PHOTO tiles as final media;
- current Home, Articles, Work, Contact, Portfolio OS, or chrome captures;
- baseline replacement;
- visual CI readiness;
- live CMS compatibility;
- CMS migrations or writes;
- production deployment.

Remaining blockers before visual-baseline approval can even be *prepared*:

- C1–C9 implemented and re-reviewed against Page 28;
- final Work imagery supplied and approved;
- viewport coverage (1440 / 1024 / 768 / 390) and required breakpoint evidence exist as repository controls, not merely as this policy sentence;
- a new Page 28 parity review after those changes;
- human-reviewed baseline candidates tied to a commit (Linux required before compare-only CI enforcement).

## 8. Required sequencing

1. Implement bounded corrections **C1–C9** (start with **C1** only in the next task).
2. Provide final Work imagery and obtain human approval of that imagery.
3. Add viewport coverage (canonical definitions; permanent widths 1440 / 1024 / 768 / 390; breakpoint evidence 767/769 and 1439/1441 as required by the changed task).
4. Run a **new** Page 28 parity review against the corrected implementation.
5. Prepare human-reviewed baseline candidates. Do not treat current captures as candidates.
6. Enforce compare-only visual CI **only after** approved Linux baselines exist.

Do not skip ahead to snapshot updates, visual CI, CMS writes, or production.
