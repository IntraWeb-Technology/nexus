# Quick reference

**Onboarding tier:** 30-minute operational understanding
**Audience:** Anyone opening a PR against this repository.
**Authority:** This document summarizes. Full governance documents are authoritative.
When this document conflicts with a full governance document, the full document wins.

---

## What this system is trying to accomplish

This page makes visitors feel located, not impressed. Every constraint in this
repository exists to preserve that feeling against the normalization pressure
of standard engineering practice. When a rule feels arbitrary, the question
to ask is: does removing this constraint make the visitor feel more located,
or does it make the page feel more like every other SaaS homepage?

---

## The three frozen decisions

1. Snapshots are individually authored artifacts. No shared rendering logic.
2. Mobile is a separate recognition surface. Not a scaled-down desktop.
3. Inconsistency in specific layers is load-bearing. Do not normalize it.

---

## CRITICAL rules — violation collapses doctrine, PR must be rejected

- **[C-01]** Snapshot files may not import from sibling snapshot files.
- **[C-02]** Snapshot files may not import from shared snapshot infrastructure.
  No `/src/components/snapshots/_shared/` directory may exist.
- **[C-03]** Snapshot geometry may not be extracted into shared rendering components.
  `Snapshot.tsx`, `DiagramNode.tsx`, `DiagramRenderer.tsx` and similar files
  are forbidden by name and by function.
- **[C-04]** Mobile snapshots for SN-02, SN-05, SN-06 must be separately authored,
  not responsively scaled.
- **[C-05]** Cross-section spacing must not be unified. Per-section spacing tokens
  are intentional. A `<Section>` wrapper that enforces uniform vertical rhythm
  is forbidden.
- **[C-06]** Annotation placement may not be abstracted into a positioning system.
  Labels are hand-placed per artifact.
- **[C-07]** The Filter section's column weight imbalance must not be equalized.
  The Not For column is intentionally heavier.
- **[C-08]** The dark Argument band (Section 3) must not be smoothly transitioned
  into or out of. It is a structural rupture, not a section.

---

## STRUCTURAL rules — violation likely indicates drift, requires doctrine review before merge

- **[S-01]** Any new file in `/src/components/` not matching an approved pattern
  requires governance justification in the PR.
- **[S-02]** Tailwind `@apply` consolidation across snapshot or section files
  is presumed dangerous until reviewed.
- **[S-03]** Geometry utilities in `/src/lib/geometry-math.ts` must operate on
  values, not structure. If a function's signature contains operational vocabulary
  (node, edge, hub, annotation, snapshot, layout), it belongs in the authored
  artifact, not the utility file.
- **[S-04]** If `/src/lib/geometry-math.ts` exceeds 200 lines, audit before merge.
- **[S-05]** Storybook stories for snapshot components must not share controls
  or expose variant props. Each snapshot gets an isolated story.
- **[S-06]** Visual regression testing must not be applied to snapshot components.
  It pressures toward visual stability, which is the wrong optimization.
- **[S-07]** Any Intersection Observer or scroll-tied behavior must be reviewed
  against `/docs/doctrine/04-scroll-psychology.md` before merge.

---

## Forbidden commit vocabulary

Commit messages and PR titles containing these words trigger the governance
scanner and require doctrine justification:

`normalized` `standardized` `unified` `harmonized` `consolidated`
`reusable` `simplified` `consistent` `consistency` `cleanup`

These words describe engineering maturity in most repositories.
In this repository they frequently describe operational erosion.
See `inverted-vocabulary.md` for the full explanation.

---

## Forbidden file and pattern names

Creating any of the following is a CRITICAL violation:

- `Snapshot.tsx` / `Snapshot.ts`
- `DiagramNode.tsx` / `DiagramEdge.tsx` / `DiagramHub.tsx`
- `DiagramRenderer.tsx` / `SnapshotRenderer.tsx` / `RenderSnapshot.tsx`
- `snapshots/index.tsx` that maps IDs to a shared component with config props
- `snapshots/_shared/` directory of any kind
- Any component with a prop named `snapshotType`, `diagramKind`, or `layoutVariant`

---

## Stop and ask before proceeding

Open a governance issue and wait for review when:

- A new file in `/src/components/` does not match an approved pattern
- A single commit touches multiple protected directories
- A refactor reduces total line count by more than 20% (abstraction extraction signal)
- Any change to spacing tokens across more than one section
- Any change to the annotation primitive API
- Any change to a governance or doctrine document
- Any rule in this document seems wrong for your specific case

Do not resolve governance questions unilaterally. Open the issue.

---

## Approved abstractions (complete list)

These are the only shared constructs permitted:

| Abstraction | Path | What it is |
|-------------|------|------------|
| Typography primitives | `src/components/primitives/typography.tsx` | Heading scales, monospace label |
| Annotation label | `src/components/snapshots/_primitives/AnnotationLabel.tsx` | Positioned text. API: `position`, `text`, `weight` only |
| Section wrapper | `src/components/layout/SectionWrapper.tsx` | Per-section spacing tokens. No uniform rhythm enforcement |
| Color tokens | `tailwind.config.ts` | Locked palette. No layout tokens |
| Geometry math | `src/lib/geometry-math.ts` | Value-level SVG math only. No structural vocabulary |

Nothing else is shared. Duplication outside this list is acceptable.

---

## Per-section high-risk warnings

| Section | Risk | Rule |
|---------|------|------|
| Hero | Do not center. Asymmetric weight is intentional | [C-05] |
| Friction | List item line lengths are irregular. Do not balance | [C-05] |
| Argument | Dark band is structural rupture. No smooth transition | [C-08] |
| Proof | Governed by `/docs/governance/05-proof-section-governance.md` | [C-01–C-06] |
| Filter | Not For column is heavier. Do not equalize | [C-07] |
| All snapshots | Governed by `05-snapshot-authoring-protocol.md` | [C-01–C-06] |

---

## Going deeper

Read these when the quick reference is insufficient for your decision:

| File | Answers |
|------|---------|
| `implementation-governance/00-read-this-first.md` | Full governance index and architecture |
| `implementation-governance/01-forbidden-refactors.md` | Complete forbidden refactor list |
| `implementation-governance/02-approved-abstractions.md` | Full approved abstraction specs |
| `implementation-governance/03-normalization-danger-signs.md` | Code smell detection |
| `implementation-governance/04-section-specific-warnings.md` | Per-section build rules |
| `implementation-governance/05-snapshot-authoring-protocol.md` | Snapshot construction rules |
| `implementation-governance/06-review-checklist.md` | Pre-merge review process |
| `implementation-governance/07-when-to-stop-and-ask.md` | Escalation procedures |
| `implementation-governance/inverted-vocabulary.md` | Why normal words mean erosion here |
| `implementation-governance/acceptable-inconsistency.md` | Load-bearing vs accidental unevenness |
| `/docs/doctrine/01-positioning-foundation.md` | What IntraWeb is and what the page communicates |
| `/docs/doctrine/02-snapshot-doctrine.md` | Snapshot system accuracy rules |
| `/docs/doctrine/03-environmental-doctrine.md` | Page atmosphere and spacing behavior |
| `/docs/doctrine/04-scroll-psychology.md` | Tension, decompression, scroll arc |
| `/docs/doctrine/05-proof-section-governance.md` | Proof section production spec |
| `/docs/doctrine/06-acceptable-inconsistency.md` | Inconsistency as architecture |