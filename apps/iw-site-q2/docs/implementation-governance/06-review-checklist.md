# 06 — Review checklist

**Onboarding tier:** 30-minute operational understanding
**Severity:** Procedural — this checklist is the gate between approval
and merge for any PR touching protected directories.
**Audience:** Reviewers. Contributors should self-apply the checklist
before requesting review.

---

## How to use this document

Every PR that touches a protected directory is reviewed against the
checklist below. The checklist is structured in three tiers:

- **Tier A — mechanical**: items the repository enforces automatically.
  The reviewer confirms the checks ran and passed.
- **Tier B — pattern review**: items that require reading the diff
  against the rules in this governance bundle.
- **Tier C — doctrine review**: items that require interpreting the
  change against the perceptual doctrine. Required for changes
  affecting load-bearing properties.

A PR that fails any item is rejected with the failing item cited.
Rejection does not require negotiation — the rule provides the
rationale and the doctrine reference provides the authority.

---

## Protected directories

For the purpose of this checklist, "protected directories" are:

- `src/components/snapshots/` — all snapshot files and primitives
- `src/components/sections/` — all section files (when introduced)
- `src/components/layout/` — section wrapper and layout primitives
- `src/components/primitives/` — typography and other approved primitives
- `src/lib/geometry-math.ts` — pure math utility
- `tailwind.config.ts` — design token boundary
- `docs/doctrine/` — the doctrine layer
- `docs/governance/` — the governance layer
- `implementation-governance/` — this directory
- `.github/` — CODEOWNERS, PR template, and CI configuration

A PR that does not touch any protected directory follows the standard
review process for the repository. The remainder of this document
applies to PRs that do touch a protected directory.

---

## Tier A — mechanical checks

These items are enforced automatically. The reviewer confirms.

- [ ] **A-01** — All required CI checks have passed.
- [ ] **A-02** — ESLint reports no errors. Specifically: the
  no-restricted-imports rule for the snapshots directory has not
  been disabled or bypassed in any file.
- [ ] **A-03** — TypeScript reports no errors.
- [ ] **A-04** — The PR template has been completed. Specifically:
  the doctrine justification field is populated for protected-area
  changes.
- [ ] **A-05** — CODEOWNERS-required reviewers have approved.
- [ ] **A-06** — The commit scanner has flagged no commits with
  forbidden vocabulary, OR each flagged commit has a verification
  note explaining why the vocabulary was used.
- [ ] **A-07** — Test suite passes. Tests added are functional or
  accessibility tests; no visual regression tests have been added.

---

## Tier B — pattern review

These items require reading the diff against the rules. They are
the bulk of the reviewer's work. The list is organized by what the
PR touches.

### B-S — Snapshot files

If the PR touches anything under `src/components/snapshots/`:

- [ ] **B-S-01** — No file imports from a sibling snapshot. ([C-01], F-04)
- [ ] **B-S-02** — No file imports from `src/components/snapshots/_shared/`
  and no such directory exists. ([C-02], F-03)
- [ ] **B-S-03** — No new files match a forbidden name pattern from
  `01-forbidden-refactors.md`. Specifically: no `Snapshot.tsx`,
  `DiagramNode.tsx`, `DiagramRenderer.tsx`, or any synonym from F-01
  or F-02.
- [ ] **B-S-04** — No new component accepts a `snapshotType`,
  `diagramKind`, `layoutVariant`, or similar prop. (forbidden prop list)
- [ ] **B-S-05** — `AnnotationLabel` still accepts exactly three props:
  `position`, `text`, `weight`. No expansion. ([C-06], F-12)
- [ ] **B-S-06** — All annotation positions in modified snapshots are
  literal coordinates, not function calls. (F-11, D-05)
- [ ] **B-S-07** — Mobile changes for SN-02, SN-05, SN-06 appear in
  `.mobile.tsx` files, not as responsive prefixes on desktop files.
  ([C-04], F-15)
- [ ] **B-S-08** — Mobile snapshot files do not import from their
  desktop counterparts. (F-16)
- [ ] **B-S-09** — Storybook stories for snapshots have no controls,
  variants, or args. ([S-05], D-03)
- [ ] **B-S-10** — No visual regression tests have been added or
  modified to cover snapshots. ([S-06], F-06, D-14)

### B-L — Layout and sections

If the PR touches anything under `src/components/layout/`,
`src/components/sections/`, or `src/components/primitives/`:

- [ ] **B-L-01** — No new shared section component has been introduced.
  The legitimate construct is `SectionWrapper` only. ([C-05], F-07, D-10)
- [ ] **B-L-02** — `SectionWrapper`'s API still requires per-section
  spacing tokens (`spacing="hero"`, `spacing="friction"`, etc.). No
  default value, no generic value. (A3 in `02-approved-abstractions.md`,
  D-07)
- [ ] **B-L-03** — Spacing tokens have not been consolidated across
  sections. If two sections share a token value today, they declare it
  separately. ([C-05], F-08)
- [ ] **B-L-04** — Argument band has no smooth transitions, gradients,
  or softened boundaries at its top or bottom edges. ([C-08], F-09)
- [ ] **B-L-05** — Filter section columns are not equalized in width,
  weight, or content length. ([C-07], F-10)
- [ ] **B-L-06** — Typography primitive surface is unchanged, or
  changes are within the bounded API in A1. (A1 in
  `02-approved-abstractions.md`)
- [ ] **B-L-07** — No `Card`, `Tile`, `Panel`, or similar generic
  container component has been introduced for use inside sections.
  (Pillars, Filter section warnings)

### B-G — Geometry math

If the PR touches `src/lib/geometry-math.ts`:

- [ ] **B-G-01** — No function signature contains operational
  vocabulary (`node`, `edge`, `hub`, `spoke`, `annotation`, `label`,
  `snapshot`, `diagram`, `layout`, `section`, `panel`, `band`).
  ([S-03], F-13, D-06)
- [ ] **B-G-02** — All function parameters are `number` or
  `{ x: number; y: number }` shapes. No structural object shapes.
- [ ] **B-G-03** — File length is under 200 lines. If over, an audit
  has been completed and noted in the PR. ([S-04], F-14)
- [ ] **B-G-04** — No function in this file replaces logic that should
  remain inside a snapshot file.

### B-T — Tailwind config

If the PR touches `tailwind.config.ts`:

- [ ] **B-T-01** — Color tokens are added to or modified within the
  locked palette structure. No off-palette colors.
- [ ] **B-T-02** — No spacing scale has been introduced that purports
  to apply uniformly across sections. (A4)
- [ ] **B-T-03** — No layout tokens have been added.
- [ ] **B-T-04** — No `@apply` consolidation has been introduced
  across snapshot or section files. ([S-02], D-08)

### B-D — Documentation

If the PR touches `docs/doctrine/`, `docs/governance/`, or
`implementation-governance/`:

- [ ] **B-D-01** — A governance issue exists referencing this change.
  Doctrine and governance documents are not modified through PRs alone.
- [ ] **B-D-02** — A doctrine reviewer has approved the change in the
  governance issue.
- [ ] **B-D-03** — The change does not silently invalidate a rule
  referenced from another document. Cross-references have been updated.
- [ ] **B-D-04** — If the change relaxes a CRITICAL or STRUCTURAL rule,
  the rationale describes why implementation evidence supports the
  relaxation (per the architecture-frozen criteria in `00-read-this-first.md`).

---

## Tier C — doctrine review

Tier C applies when the PR's change affects a load-bearing property.
The doctrine review checkpoint is required for:

- Any change to spacing tokens across more than one section
- Any change to the annotation primitive API
- Any addition or modification of an approved abstraction
- Any change to `geometry-math.ts` that adds or modifies a function
- Any change to a section's wrapper or rupture treatment
- Any change to the mobile treatment of SN-02, SN-05, or SN-06
- Any commit reducing total line count by more than 20% in protected
  directories
- Any single commit that touches multiple protected directories
- Any PR flagged by the commit scanner where the verification note
  acknowledges the change does normalize an authored property

For each Tier C trigger, a doctrine reviewer applies the following:

- [ ] **C-01** — The change has been evaluated against the relevant
  doctrine document(s). The doctrine reference is cited in the PR.
- [ ] **C-02** — The change does not collapse a load-bearing property
  identified in `/docs/doctrine/06-acceptable-inconsistency.md`.
- [ ] **C-03** — If the change introduces consistency in a layer where
  consistency is mandatory, the consistency has been verified against
  the layer's specification.
- [ ] **C-04** — If the change preserves or introduces inconsistency
  in a layer where inconsistency is load-bearing, the inconsistency
  is traceable to a specific perceptual effect named in the doctrine.
- [ ] **C-05** — The "located, not impressed" governing principle has
  been applied. The change makes the visitor feel more located, or at
  minimum does not move toward "impressed."

---

## Per-section review additions

When the PR touches a specific section, apply the per-section warnings
in `04-section-specific-warnings.md`. Each section has a build-time
test the reviewer runs against the change.

- [ ] **Hero**: Three-second scan test. Visitor carries away
  positioning, not aesthetics.
- [ ] **Friction**: Items feel like distinct patterns, not uniform
  bullet points.
- [ ] **Argument**: Cognitive shift on band entry, not visual
  continuation.
- [ ] **Pillars**: Pillars distinguished by content alone, not visual
  treatment.
- [ ] **Proof**: Proof governance document referenced and applied.
- [ ] **Model**: Reads as operational description, not sales document.
- [ ] **Continuity**: Reads as operational realism, not retainer pitch.
- [ ] **Filter**: Not For column carries more weight at scan speed.
- [ ] **CTA**: Procedural, not pressured. Single action, maximum space.

---

## Phase boundary review

At each phase boundary in the milestone model
(`00-read-this-first.md`), a doctrine review checkpoint is held that
extends beyond per-PR review.

The phase boundary review covers:

- [ ] **P-01** — Whole-page convergence check. Sections still feel
  distinct. Density variation per `03-environmental-doctrine.md`
  remains visible.
- [ ] **P-02** — Scroll arc check. Tension accumulation through
  Friction, register shift at Argument, decompression mechanics
  intact per `04-scroll-psychology.md`.
- [ ] **P-03** — Mobile reconstruction check (Phase 2 boundary).
  SN-02, SN-05, SN-06 mobile artifacts read as recognition surfaces,
  not as scaled-down desktop.
- [ ] **P-04** — Forbidden vocabulary audit. Commit history reviewed
  for accumulated drift across the phase. The commit scanner only
  flags individual commits; the audit catches drift that emerged
  from many small changes.
- [ ] **P-05** — Approved abstraction list audit. Number of approved
  abstractions has not silently grown via files placed in
  unprotected paths.
- [ ] **P-06** — Section convergence detection (D-13). Visual review
  of the whole page, not per-section.

The phase boundary review is held by the doctrine reviewer with at
least one frontend contributor present. The output is a written note
attached to the phase gate issue indicating each item's status.

---

## Rejection process

A PR that fails any Tier A item is rejected by the mechanical layer
and does not reach human review.

A PR that fails a Tier B item is rejected with a comment citing the
failing rule, the document it is defined in, and (if applicable) the
suggested remediation.

A PR that fails a Tier C item is rejected, the governance issue is
opened or referenced, and the change is not reattempted until the
doctrine question has been resolved.

Rejection is not a judgment of the contributor. The doctrine review
exists to protect the page from drift that no individual contributor
can be expected to detect. A rejection at Tier C frequently means
the doctrine itself needs sharpening, not that the contributor
made a mistake. The governance issue provides the venue for that
discussion.

---

## When the checklist seems wrong

If a checklist item appears wrong for a specific PR, do not bypass
it. Open a governance issue tagged `governance-question`. The
escalation procedure in `07-when-to-stop-and-ask.md` applies.

The checklist is updated through governance review, not through
case-by-case discretion. A reviewer who finds themselves making
exceptions for PRs is the signal that either the checklist or the
PR pattern needs governance attention.

---

## Verification

This document is procedural. It defines the verification process; it
does not have a verification process of its own beyond the doctrine
review checkpoints described above.

The pre-merge checks for any specific PR are produced by combining
Tier A (mechanical, automated), Tier B (pattern review, manual), and
Tier C where applicable (doctrine review, manual with doctrine
reviewer present).

---

## Survivability risks

The most likely failure modes for this checklist over time:

- **Tier A as substitute for Tier B** — reviewers seeing CI green
  and approving without reading the diff against the rules. Tier B
  is the heart of the review and cannot be skipped.
- **Tier C never triggered** — Tier C requires the reviewer to
  recognize when a load-bearing change is happening. Contributors
  rarely flag their own PRs as Tier C. The reviewer must.
- **Phase boundary review skipped under launch pressure** — the
  whole-page checks (P-01, P-02, P-06) are the only mechanism that
  catches accumulated drift. They cannot be deferred past the gate.
- **Rejection becoming personalized** — rejection is procedural.
  When it becomes a discussion of who is right rather than which
  rule applies, the checklist is being abandoned.

---

## Assumptions and unresolved dependencies

- CODEOWNERS protections, ESLint rules, and the commit scanner
  are configured to enforce Tier A items. The repository configuration
  phase (not yet in scope) implements these.
- The PR template at `.github/pull_request_template.md` includes a
  doctrine justification field. The template is produced in the
  repository configuration phase.
- The `governance-question` issue label exists in the repository.
  Configured in the repository configuration phase.
- A doctrine reviewer role is defined and at least one person occupies
  it. Role assignment is project-level and not in this document's scope.
- Phase boundaries trigger phase boundary reviews. The mechanism
  (calendar, milestone, gate issue) is project-level and not in this
  document's scope.
