# 01 — Forbidden refactors

**Onboarding tier:** 30-minute operational understanding
**Severity:** CRITICAL — every item in this document is a merge-blocking violation
**Authority:** This document enumerates. `QUICK-REFERENCE.md` summarizes.
When this document and the quick reference disagree, this document wins.

---

## How to read this document

Each forbidden refactor below is paired with the doctrine property it would
collapse and the rule ID it violates. The rule IDs match the CRITICAL and
STRUCTURAL identifiers in `QUICK-REFERENCE.md`. They do not change.

A refactor is forbidden because it produces a measurable loss of operational
recognition, not because of taste. Every entry below has a doctrine reference.
If you cannot find the doctrine reference, the rule is wrong and should be
revised through governance, not bypassed.

---

## Forbidden refactors — snapshot system

### F-01 — Extracting a shared `Snapshot` component

Rule: [C-03]
Doctrine: `/docs/doctrine/02-snapshot-doctrine.md`

Producing a single component that the seven snapshots instantiate with
configuration props collapses snapshot independence. Each snapshot expresses
a specific operational failure geometry. A shared renderer normalizes
geometry across snapshots and erases the recognition mechanic.

Forbidden file names by literal match:
- `Snapshot.tsx`
- `Snapshot.ts`
- `BaseSnapshot.tsx`
- `SnapshotBase.tsx`
- `AbstractSnapshot.tsx`

Forbidden by function regardless of file name: any component that accepts
a snapshot identifier or layout descriptor and produces a snapshot from it.

### F-02 — Extracting shared snapshot rendering primitives

Rule: [C-03]
Doctrine: `/docs/doctrine/02-snapshot-doctrine.md`

Forbidden file names by literal match:
- `DiagramNode.tsx`
- `DiagramEdge.tsx`
- `DiagramHub.tsx`
- `DiagramRenderer.tsx`
- `SnapshotRenderer.tsx`
- `RenderSnapshot.tsx`
- `SnapshotPrimitives.tsx`
- `DiagramPrimitives.tsx`

These are forbidden even if they begin life as utility components for a
single snapshot. The risk is not their initial use — the risk is that a
later refactor will reach for them across snapshots. Naming them this way
creates the gravitational well that produces the violation.

If you need internal structure within one snapshot file, define it inline
within that file. Do not name it as if it could be reused.

### F-03 — Creating `_shared/` under snapshots

Rule: [C-02]
Doctrine: `/docs/doctrine/02-snapshot-doctrine.md`

The directory `src/components/snapshots/_shared/` may not exist for any
reason. ESLint enforces an import boundary. CODEOWNERS protects the parent
directory. Any PR that introduces this directory is rejected at the
mechanical layer before review.

The legitimate primitives directory is `src/components/snapshots/_primitives/`
and contains exactly one file: `AnnotationLabel.tsx`. The leading underscore
distinguishes it from snapshot files at glob level. The plural form
(`_primitives`) is intentional and may be expanded only through the approved
abstractions process.

### F-04 — Sibling snapshot imports

Rule: [C-01]
Doctrine: `/docs/doctrine/02-snapshot-doctrine.md`

A snapshot file may not import from another snapshot file. This includes:

- `import { ... } from './SN-02'` from within `SN-01.tsx`
- Re-exports from `snapshots/index.tsx` that round-trip values between siblings
- Type-only imports of geometry, position, or layout values from siblings
- Importing a sibling's mobile variant from within a desktop snapshot

ESLint enforces this with a no-restricted-imports rule scoped to the
snapshots directory. The rule has no exceptions. If two snapshots happen
to use a similar geometry value, both must declare it independently.

### F-05 — Snapshot index file that maps to a shared component

Rule: [C-03]
Doctrine: `/docs/doctrine/02-snapshot-doctrine.md`

The pattern is forbidden in any of these forms:

```ts
// FORBIDDEN — maps IDs to a renderer
export const snapshots = {
  'SN-01': <Snapshot type="hub-failure" />,
  'SN-02': <Snapshot type="orphaned-process" />,
};
```

```ts
// FORBIDDEN — config-driven dispatch
export function renderSnapshot(id: SnapshotId, config: SnapshotConfig) { ... }
```

```ts
// FORBIDDEN — registry pattern that pressures toward shared rendering
const SNAPSHOT_REGISTRY = new Map<SnapshotId, SnapshotComponent>();
```

A `snapshots/index.ts` may exist solely as a barrel that re-exports each
snapshot file as a named export. It may not contain logic, props, types
that describe snapshot variance, or a mapping from identifier to component.

### F-06 — Visual regression testing on snapshots

Rule: [S-06]
Doctrine: `/docs/doctrine/02-snapshot-doctrine.md`

Pixel-diff or screenshot regression testing applied to snapshot components
is forbidden. The mechanism is not at fault — the optimization pressure is.
A failing visual regression test creates organizational pressure to stabilize
the visual output. Stability across iterations is the wrong target for
authored artifacts, which evolve as the operational doctrine sharpens.

Functional tests, accessibility tests, and tests asserting that specific
text content is present remain required.

---

## Forbidden refactors — section and layout system

### F-07 — Unified `Section` wrapper enforcing vertical rhythm

Rule: [C-05]
Doctrine: `/docs/doctrine/03-environmental-doctrine.md`

A component that wraps every section and applies the same vertical padding
or margin tokens is forbidden. Specifically, a wrapper of this shape:

```tsx
// FORBIDDEN
<Section padding="standard"> ... </Section>
```

`SectionWrapper` exists at `src/components/layout/SectionWrapper.tsx` but
is permitted only because it accepts per-section spacing tokens, not a
unified scale. The legitimate API is documented in `02-approved-abstractions.md`.

A section component that defaults to a single spacing value, even with an
override prop, drifts toward unification because the default becomes the
de facto rhythm and overrides become exceptions to be cleaned up.

### F-08 — Cross-section spacing token consolidation

Rule: [C-05]
Doctrine: `/docs/doctrine/03-environmental-doctrine.md`

Per-section spacing tokens may not be consolidated into a single scale.
The Friction section runs tighter. The Model section opens. The Argument
band has its own internal rhythm. These differences are authored.

A commit that touches spacing tokens in more than one section file
requires governance review per the stop-and-ask list.

### F-09 — Smooth transitions across the Argument band boundary

Rule: [C-08]
Doctrine: `/docs/doctrine/03-environmental-doctrine.md`,
`/docs/doctrine/04-scroll-psychology.md`

The dark band that contains the Argument section is a structural rupture.
The visitor must register a register change, not a section change.
The following are forbidden:

- Gradient backgrounds that fade between the prior section and the band
- Color transitions on scroll that ease the band in or out
- Decorative borders or dividers that soften the boundary
- Padding values on the band's outer edges that treat it as a section
  with breathing room from neighbors

The band must arrive abruptly and end abruptly. The boundaries are sharp
because the cognitive shift is sharp.

### F-10 — Equalizing the Filter section columns

Rule: [C-07]
Doctrine: `/docs/doctrine/01-positioning-foundation.md`,
`/docs/doctrine/03-environmental-doctrine.md`

The Not For column is heavier than the For column. This produces the
specific perceptual effect of self-disqualification carrying more
operational weight than self-qualification — which is the correct buyer
psychology for this positioning.

Forbidden refactors:

- CSS that grids the columns into equal widths
- Trimming Not For content to match For length
- Padding adjustments that visually balance the two
- A shared `<FilterColumn>` component that produces identical styling
  with content variance only

The two columns are different artifacts. Build them separately.

---

## Forbidden refactors — annotation system

### F-11 — Algorithmic annotation positioning

Rule: [C-06]
Doctrine: `/docs/doctrine/02-snapshot-doctrine.md`

The following are forbidden:

- A function that takes a node and computes annotation position
- A layout system that places annotations to avoid collisions
- A configuration object describing annotation placement rules
- Any code path where annotation position is derived rather than declared

Annotations are hand-placed per snapshot. Each placement expresses the
specific spatial relationship between the label and the operational
condition it names. Algorithmic placement produces consistent — and
inaccurate — positioning.

### F-12 — Annotation API expansion beyond `position`, `text`, `weight`

Rule: [C-06]
Doctrine: `/docs/doctrine/02-snapshot-doctrine.md`

The `AnnotationLabel` primitive accepts exactly three props:
- `position`
- `text`
- `weight`

Adding any of the following props is forbidden:
- `variant`, `kind`, `type`, `flavor`
- `severity`, `tone`, `color`
- `arrow`, `connector`, `pointTo`
- `offset`, `nudge`, `placement`
- `hide`, `show`, `responsive`

If a snapshot needs an annotation that the three-prop API cannot express,
the correct response is to render that annotation inline within the
snapshot file using raw SVG or HTML. It is not to expand the primitive's API.

---

## Forbidden refactors — geometry math

### F-13 — Operational vocabulary in geometry math signatures

Rule: [S-03]
Doctrine: `/docs/doctrine/02-snapshot-doctrine.md`

`src/lib/geometry-math.ts` contains pure math: distance, angle,
intersection, bezier control point calculation, viewBox arithmetic.
Function signatures may not reference operational concepts:

Forbidden parameter and function names within `geometry-math.ts`:
- `node`, `nodes`, `edge`, `edges`, `hub`, `spoke`
- `annotation`, `label`, `callout`
- `snapshot`, `diagram`, `layout`
- `section`, `panel`, `band`

These names belong inside the authored snapshot file, where their meaning
is grounded in the specific artifact. In the math utility, they pressure
the file toward becoming a rendering layer.

The math utility receives values like `{ x: number, y: number }` and
returns values of the same shape. It does not know what those values
represent.

### F-14 — Geometry math file growth past 200 lines

Rule: [S-04]
Doctrine: `/docs/doctrine/02-snapshot-doctrine.md`

If `geometry-math.ts` exceeds 200 lines, an audit is required before
the merging PR is approved. The threshold is heuristic — the actual
question is whether the file has accumulated structural logic that
belongs inside snapshot files.

Common drift pattern: a snapshot needs a specific path calculation,
the calculation is moved to the utility "for cleanliness," then a
second snapshot uses a slightly different version of the same calculation,
then a parameterized version replaces both. By the third such migration,
the utility has become a de facto renderer.

The audit asks: would removing each function from this file and inlining
it into the one snapshot that uses it improve clarity? If yes for several
functions, the file has drifted.

---

## Forbidden refactors — mobile

### F-15 — Responsive scaling of SN-02, SN-05, SN-06

Rule: [C-04]
Doctrine: `/docs/doctrine/02-snapshot-doctrine.md`,
`/implementation-governance/05-snapshot-authoring-protocol.md`

These three snapshots have separate mobile artifacts. A responsive layout
that scales the desktop snapshot to fit a narrow viewport is forbidden
for these three. The mobile artifact is built from operational ground
truth on mobile, not derived from desktop geometry.

The forbidden patterns include:
- A single `SN-02.tsx` file that uses Tailwind responsive prefixes to
  reposition or resize the desktop layout for mobile
- A `viewBox` that scales proportionally on mobile breakpoints
- A media query that hides desktop-only annotations on mobile
- A wrapper that swaps content but preserves the desktop container's
  geometry constraints

The required pattern is two separate files: `SN-02.tsx` and
`SN-02.mobile.tsx`. The composition layer chooses one based on viewport.

For SN-01, SN-03, SN-04, SN-07, responsive scaling is permitted because
the desktop geometry survives reduction in width without losing
operational meaning. The decision tree is in `05-snapshot-authoring-protocol.md`.

### F-16 — Shared mobile snapshot infrastructure

Rule: [C-02]
Doctrine: `/docs/doctrine/02-snapshot-doctrine.md`

Mobile snapshot files are subject to the same independence rules as
desktop snapshot files. They may not share rendering primitives. They
may not import from each other. They may not import from their desktop
counterparts.

The directory `src/components/snapshots/mobile/_shared/` is forbidden
for the same reason `src/components/snapshots/_shared/` is forbidden.

---

## Forbidden refactors — abstraction extraction

### F-17 — Extracting an abstraction during cleanup

Rule: [S-01]
Doctrine: `/docs/doctrine/06-acceptable-inconsistency.md`

A refactor that extracts a new shared component, hook, utility, or
primitive — even if the extraction is mechanically clean — is forbidden
without governance approval when the source files are in a protected
directory.

Protected directories for this rule:
- `src/components/snapshots/`
- `src/components/sections/` (when introduced)
- `src/components/layout/`

The five approved abstractions in `02-approved-abstractions.md` are the
complete permitted set. Adding a sixth requires a governance issue and
a doctrine review checkpoint, not a PR.

### F-18 — Storybook controls that expose snapshot variance

Rule: [S-05]
Doctrine: `/docs/doctrine/02-snapshot-doctrine.md`

A Storybook story for a snapshot that exposes controls for repositioning
nodes, switching layouts, or selecting variants is forbidden. The control
panel itself signals that the snapshot is configurable, which is the
property the architecture forbids.

Permitted Storybook patterns: a single isolated story per snapshot, with
no controls, no variants, no args. The story exists to render the
snapshot in isolation for visual review and accessibility audit.

---

## Renaming, relocation, and refactoring around forbidden names

The forbidden file names in this document remain forbidden under
synonyms. Specifically:

- `Snapshot.tsx` is forbidden, and so are `SnapshotComponent.tsx`,
  `SnapshotView.tsx`, `SnapshotCanvas.tsx`, `SnapshotContainer.tsx`,
  `SnapshotHost.tsx`, `RenderableSnapshot.tsx`, `GenericSnapshot.tsx`.
- `DiagramNode.tsx` is forbidden, and so are `Node.tsx`,
  `OperationalNode.tsx`, `SystemNode.tsx`, `Vertex.tsx`,
  `GraphNode.tsx`, `Box.tsx` (when used as a graph element).

The mechanism: any file in `src/components/snapshots/` whose default
export is a component intended to be reused across snapshots is forbidden,
regardless of name. The file name list is enumerative for the obvious
cases. The principle behind the list is the actual rule.

When in doubt, ask: would this component be acceptable if it lived
inside one snapshot file as an inline definition? If yes, inline it.
If the answer is "but then we'd have duplication" — duplication is
acceptable here. The independence is the architectural property.

---

## Verification (mechanical layer)

ESLint, CODEOWNERS, and the commit scanner enforce most of the rules
above without human attention. The verification commands belong in the
repository configuration phase and are not produced by this document.

The following items in this document are not mechanically enforced
and require reviewer attention at PR time:

- F-09 (smooth transitions) — visual review
- F-10 (Filter equalization) — visual review
- F-11 (algorithmic annotation positioning) — code review
- F-13 (operational vocabulary in geometry math) — code review
- F-15 (mobile responsive scaling for SN-02/05/06) — code review
- F-17 (abstraction extraction) — code review with governance escalation

The pre-merge checklist in `06-review-checklist.md` includes explicit
checkpoints for each of these.

---

## Assumptions and unresolved dependencies

This document assumes:

- The seven snapshots are SN-01 through SN-07
- Approved primitives directory is `src/components/snapshots/_primitives/`
- Mobile snapshot files use the `.mobile.tsx` suffix convention
- Geometry math utility lives at `src/lib/geometry-math.ts`

If any of these are wrong, this document propagates the error.
Confirm before mechanical layer (ESLint paths, CODEOWNERS globs)
is configured against these assumptions.
