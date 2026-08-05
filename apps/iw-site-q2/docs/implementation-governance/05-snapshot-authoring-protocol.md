# 05 — Snapshot authoring protocol

**Onboarding tier:** Deep doctrine
**Severity:** CRITICAL — every snapshot file is governed by this protocol
**Authority:** This document is the operational protocol for authoring,
modifying, or reviewing any file under `src/components/snapshots/`.

---

## What a snapshot is

A snapshot is a hand-authored visual artifact that expresses one specific
operational failure condition. The seven snapshots SN-01 through SN-07 are
the proof layer of the homepage — they are what the visitor encounters
when the page asks them to recognize their own operational territory.

A snapshot is not a diagram, a chart, a visualization, or a graphic.
The doctrine treats those words as drift signals (see `inverted-vocabulary.md`).
A snapshot is a specific authored representation. It is closer in nature
to a hand-drawn architecture sketch than to a generated visualization.

The protocol below describes what authoring a snapshot looks like, what
it explicitly is not, and how to keep it from drifting toward the latter.

---

## File structure

### Path and name

Each snapshot file lives at:

```
src/components/snapshots/SN-01.tsx
src/components/snapshots/SN-02.tsx
src/components/snapshots/SN-03.tsx
src/components/snapshots/SN-04.tsx
src/components/snapshots/SN-05.tsx
src/components/snapshots/SN-06.tsx
src/components/snapshots/SN-07.tsx
```

Mobile variants (only for SN-02, SN-05, SN-06):

```
src/components/snapshots/SN-02.mobile.tsx
src/components/snapshots/SN-05.mobile.tsx
src/components/snapshots/SN-06.mobile.tsx
```

The naming pattern is fixed. `SN-01.tsx` is the snapshot. There is no
`Snapshot01.tsx`, `SnapOne.tsx`, or similar. The hyphenated identifier
is the canonical reference everywhere — code, docs, commit messages,
governance issues.

### What the file contains

Each snapshot file is self-contained. It exports one default React
component. The component takes no props that vary its output. It may
take only props that affect its embedding (e.g. an optional `className`
to satisfy a parent's layout constraint — and even this should be rare).

Inside the file:

- The SVG (or HTML+SVG composition) that draws the snapshot
- Any inline structural definitions (path data, position constants,
  text content) used by that snapshot
- The annotation calls placing labels at literal coordinates

Outside the file (imports allowed):

- `AnnotationLabel` from `src/components/snapshots/_primitives/`
- Pure math functions from `src/lib/geometry-math.ts`
- Typography primitives from `src/components/primitives/typography.tsx`
- Tailwind classes via the standard Tailwind import path

Outside the file (imports forbidden):

- Any other snapshot file (`SN-01` may not import from `SN-02`)
- The desktop counterpart of a mobile file, or vice versa
- Anything from a `_shared/` directory (which does not exist)
- Components named `Snapshot`, `DiagramNode`, `DiagramRenderer`,
  or any forbidden-name pattern from `01-forbidden-refactors.md`

### Default export shape

```tsx
import { AnnotationLabel } from './_primitives/AnnotationLabel';
import { distance, midpoint } from '@/lib/geometry-math';

export default function SN01() {
  return (
    <svg viewBox="0 0 800 480" role="img" aria-labelledby="sn-01-title">
      <title id="sn-01-title">{/* operational failure description */}</title>
      {/* hand-authored geometry */}
      {/* literal-coordinate annotation calls */}
    </svg>
  );
}
```

The default export is a React function component. The function name
matches the file name without the hyphen (`SN01` for `SN-01.tsx`).
This is mechanically helpful for stack traces and devtools. It is
not architectural.

---

## Geometry rules

### Coordinates are literals

All position values inside a snapshot are literal coordinates. Not
constants imported from another file. Not computed from a layout
function. Not derived from a configuration object.

```tsx
// CORRECT
<rect x={120} y={80} width={160} height={64} />
<AnnotationLabel position={{ x: 304, y: 96 }} text="hub failure" />

// FORBIDDEN — derived position
<AnnotationLabel position={annotationPosition('top-right', node1)} text="..." />

// FORBIDDEN — imported constants describing snapshot structure
import { HUB_X, HUB_Y } from './positions';
<rect x={HUB_X} y={HUB_Y} ... />
```

A snapshot file may define local constants for clarity within its own
scope. It may not import structural constants from other files, and
those local constants must not be exported.

### Pure math is allowed

Pure mathematical operations that take coordinate values and return
coordinate values are allowed via `src/lib/geometry-math.ts`. The
boundary is described in A5 of `02-approved-abstractions.md` and F-13
of `01-forbidden-refactors.md`.

```tsx
// CORRECT — pure math on literal values
const labelPos = midpoint({ x: 120, y: 80 }, { x: 320, y: 80 });

// FORBIDDEN — math function that knows about operational concepts
const labelPos = annotationPositionFor(node1);
```

The principle: math operates on values; structure is authored.

### viewBox is per-snapshot

Each snapshot declares its own `viewBox`. The values are not coordinated
across snapshots. SN-01 and SN-04 are not required to share a coordinate
space. They are different artifacts.

If two snapshots happen to use the same `viewBox` dimensions, that is
incidental. Do not extract them. Do not name them. Do not consolidate them.

### No shared geometry constants

A constant like `HUB_RADIUS = 24` defined in one snapshot does not get
moved to a shared file when SN-04 also wants a hub of that radius. SN-04
declares its own `24`. If the two values diverge tomorrow because the
operational doctrine of one snapshot sharpens, the divergence happens
without negotiation.

This is the property the architecture forbids you to break: snapshots
must be free to evolve independently. Shared constants couple them.

---

## Annotation rules

### One primitive, three props

The only annotation primitive is `AnnotationLabel` at
`src/components/snapshots/_primitives/AnnotationLabel.tsx`. It accepts
exactly three props:

- `position: { x: number; y: number }`
- `text: string`
- `weight?: 'primary' | 'secondary'`

This is the entire surface. See A2 in `02-approved-abstractions.md`
for the rationale and F-12 in `01-forbidden-refactors.md` for the
forbidden expansions.

### Hand placement

Each annotation's `position` is a literal coordinate. The author places
the label by inspecting the snapshot and choosing where the label belongs
relative to the operational element it names. Algorithmic placement is
forbidden by [C-06] and F-11.

### When the primitive is insufficient

If a snapshot needs an annotation treatment that the three-prop API
cannot express — a callout with a connector line, an annotation with
a background pill, an annotation that points to a region rather than
a coordinate — the correct response is to render that annotation
inline in the snapshot file using raw SVG.

The wrong response is to add a fourth prop to `AnnotationLabel`.

### No bold weight on annotations

Per `03-environmental-doctrine.md`, no bold treatment on annotation
labels. Bold implies hierarchy within annotations, which flattens
evidential weight. The `weight="primary"` value is not a bold
treatment; it is a tonal distinction handled inside the primitive's
own typography.

---

## Mobile protocol

### Which snapshots get separate mobile files

| Snapshot | Mobile treatment |
|----------|------------------|
| SN-01 | Responsive scaling (Tailwind responsive prefixes) |
| SN-02 | Separate file: `SN-02.mobile.tsx` |
| SN-03 | Responsive scaling |
| SN-04 | Responsive scaling |
| SN-05 | Separate file: `SN-05.mobile.tsx` |
| SN-06 | Separate file: `SN-06.mobile.tsx` |
| SN-07 | Responsive scaling |

The three snapshots requiring separate mobile files are governed by
[C-04] and F-15. The decision is doctrinal, not technical: SN-02, SN-05,
and SN-06 contain operational geometry that does not survive reduction
in width. The mobile artifact is built from operational ground truth
on mobile, not derived from desktop layout.

### Decision tree for any new snapshot

If at any future point an eighth snapshot is contemplated, the question
of mobile treatment is answered by:

1. Does the desktop snapshot's operational meaning survive when the
   viewport is narrowed to a phone width without rearranging elements?
2. If yes — responsive scaling is permitted.
3. If no — a separate mobile artifact is required, and the snapshot's
   identifier must be added to [C-04] before implementation.

The decision is doctrinal. It is not made by the implementer. A
governance issue precedes the implementation.

### Mobile file independence

Mobile snapshot files are subject to all rules above. Specifically:

- They may not import from their desktop counterpart
- They may not import from another snapshot's mobile file
- They may not import from a forbidden `mobile/_shared/` directory
- They use the same `AnnotationLabel` primitive, with the same three-prop API
- Their geometry is hand-authored at literal coordinates, sized for
  the mobile viewport from the start

A mobile snapshot file is a fully independent authored artifact. The
only thing it shares with its desktop sibling is the operational
condition both express — which is a doctrinal coincidence, not a
code coupling.

### Composition

The composition layer (a section file or page-level layout) chooses
between desktop and mobile snapshots based on viewport. The composition
mechanism is permitted to be shared across snapshots — it is not a
snapshot itself, it is the surrounding section's responsibility. A
typical implementation uses Tailwind's responsive utility classes to
hide one and show the other:

```tsx
<>
  <div className="hidden md:block"><SN02 /></div>
  <div className="block md:hidden"><SN02Mobile /></div>
</>
```

Both files render in the DOM. CSS controls visibility. This is acceptable.

---

## Authoring sequence

When creating or substantially revising a snapshot, follow this sequence:

**Step 1 — Doctrine reference.**
Read the snapshot's row in the snapshot doctrine
(`/docs/doctrine/02-snapshot-doctrine.md`). Confirm what operational
condition the snapshot expresses. If the doctrine is unclear, open a
governance issue before authoring. Do not invent operational meaning.

**Step 2 — Geometry sketch.**
Sketch the snapshot's geometry on paper or in a draft tool. Identify
the structural elements and their spatial relationships. The sketch
is the source of truth for the file; the file is a faithful
implementation of the sketch.

**Step 3 — Annotation positions.**
Identify which elements are annotated and where each label sits.
Annotation positions are part of authoring, not a post-hoc layout step.

**Step 4 — File creation.**
Create the file with the structure described above. Define geometry
inline at literal coordinates. Place annotations via `AnnotationLabel`
at literal positions.

**Step 5 — Mobile decision (if applicable).**
If the snapshot is one of the three requiring separate mobile files,
return to step 1 for the mobile artifact and author it independently.
Do not begin the mobile artifact by copying the desktop file.

**Step 6 — Storybook story.**
Create a Storybook story that renders the snapshot in isolation with
no controls, no variants, no args (per [S-05]).

**Step 7 — Functional and accessibility tests.**
Add tests asserting that the snapshot renders, that text content is
present, and that ARIA semantics are correct. Do not add visual
regression tests (per [S-06] and F-06).

**Step 8 — PR submission.**
Reference the doctrine row in the PR description. Indicate which
governance documents were consulted. The pre-merge checklist in
`06-review-checklist.md` will be applied at review.

---

## Anti-patterns

The following patterns commonly arise during snapshot authoring and
are forbidden:

### Sketching a "snapshot system"

A contributor begins by designing a system that will produce all seven
snapshots, then plans to instantiate the system seven times. This is
the violation that [C-03] forbids in its most direct form. The
authoring model is the inverse: each snapshot is sketched first,
independently, and any apparent commonality is incidental.

### "I'll just extract this and inline it later"

A contributor extracts a shared structure during authoring with the
intent of inlining it before merging. This pattern almost always
produces a forgotten extraction that survives into review and gets
approved on the basis that "we'll consolidate later." The correct
sequence is to inline from the start. There is no later.

### Storybook-driven authoring

A contributor builds a Storybook story with controls and uses the
controls to iterate on geometry, then locks the controls to a single
state and merges. The result is a snapshot with vestigial props and
a story that exposed those props during development. Both are
violations of [C-03] and [S-05]. Iterate by editing literal
coordinates in the file. Do not use props as a development convenience.

### Visual diff as a confidence signal

A contributor relies on screenshot diffs to confirm the snapshot is
"the same" before and after a refactor. This signals that visual
stability has become the implicit success metric, which is the wrong
optimization per [S-06]. Confidence in a snapshot's correctness comes
from doctrine review, not pixel comparison.

### Naming a structure as if it were reusable

A contributor names an inline component `<HubNode>` even though it is
defined within a single snapshot file. The name implies reusability
even when the implementation does not provide it. The naming is the
risk — the next contributor reads the name and reaches for it from
another snapshot. Use names that are self-evidently scoped to one
snapshot, or do not name the structure at all.

---

## Verification

Mechanical layer:

- ESLint enforces no-restricted-imports between snapshot files
- ESLint enforces no imports from a non-existent `_shared/` directory
- CODEOWNERS protects `src/components/snapshots/` and requires owner review
- The PR template requires a snapshot identifier when files in this
  directory change

Manual review checkpoints (each is a pre-merge gate):

- [ ] No imports between sibling snapshot files
- [ ] No new files in `src/components/snapshots/` outside of `SN-XX.tsx`,
      `SN-XX.mobile.tsx`, or `_primitives/AnnotationLabel.tsx`
- [ ] No new props on `AnnotationLabel`
- [ ] All annotation positions are literal coordinates
- [ ] No function in `geometry-math.ts` accepts or returns operational
      vocabulary types
- [ ] Mobile changes for SN-02/SN-05/SN-06 are in `.mobile.tsx` files,
      not responsive prefixes on the desktop file
- [ ] Storybook story has no controls, variants, or args
- [ ] No visual regression tests added

---

## Survivability risks

The following risks are most likely to compromise this protocol over time:

- **Authoring under deadline pressure** — when a snapshot is needed
  quickly, the temptation to copy SN-01 and edit it into SN-02 is high.
  The result is silent coupling at the level of structural choices that
  were specific to SN-01. The protocol mitigation is the doctrine
  reference at step 1: the next snapshot's authoring begins from its
  doctrine row, not from another snapshot's file.
- **AI-assisted authoring** — code generation tools default toward
  abstraction and reuse. They will propose `<DiagramNode>` because that
  is what most codebases want. Reviewers must catch these proposals
  even when the suggested code looks clean.
- **Mobile artifacts derived from desktop** — even when separate mobile
  files exist, the act of "translating" a desktop snapshot to mobile
  encodes desktop assumptions that the doctrine forbids. The mobile
  artifact begins from the operational condition, not from the desktop
  artifact.
- **Drift through accumulated minor edits** — a snapshot that began as
  hand-authored can accumulate small "improvements" over many commits
  until it has been silently abstracted. The doctrine review checkpoints
  in `06-review-checklist.md` are the mitigation.

---

## Assumptions and unresolved dependencies

- The seven snapshot identifiers (SN-01 through SN-07) and the three
  with separate mobile files (SN-02, SN-05, SN-06) are fixed and match
  `QUICK-REFERENCE.md`.
- The primitives directory is `src/components/snapshots/_primitives/`.
  This is permitted; `_shared/` is forbidden. The distinction is
  load-bearing.
- Geometry math lives at `src/lib/geometry-math.ts` per A5.
- The composition pattern using Tailwind responsive classes is one
  implementation; if a project decision selects a different mechanism
  (e.g. a single `<ResponsiveSnapshot>` selector), this document must
  be updated to describe that mechanism without violating the
  independence rules.
