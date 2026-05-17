# 03 — Normalization danger signs

**Onboarding tier:** 30-minute operational understanding
**Severity:** Heuristic — these are signals that require investigation,
not automatic violations
**Audience:** Reviewers, contributors writing or reading PRs in protected
directories.

---

## What this document is for

The CRITICAL and STRUCTURAL rules in `QUICK-REFERENCE.md` and
`01-forbidden-refactors.md` describe outcomes that are forbidden. This
document describes patterns that frequently produce those outcomes when
followed to completion.

A danger sign is not a violation. It is a code smell. The pattern signals
that a contribution is moving toward a forbidden state and that the next
commit, the next refactor, or the next "cleanup pass" will land it there.

The correct response to a danger sign is to pause, name what is happening,
and verify the trajectory. In most cases the contribution can be redirected
without rejection. In some cases the danger sign is a false positive and
the contribution proceeds. In a few cases the danger sign is the leading
edge of a CRITICAL violation and must be stopped.

---

## D-01 — Two snapshots that look like they could share something

**Pattern:** A reviewer or contributor notices that SN-02 and SN-04 both
render an SVG with a hub-and-spoke geometry. The instinct is to extract
the shared structure into a reusable component.

**Why it is dangerous:** The instinct is correct in most codebases and
wrong here. Per [C-03] and `/docs/doctrine/02-snapshot-doctrine.md`, the
visual similarity is incidental. The two snapshots express different
operational failures that happen to share a topological feature. A
shared primitive would force the two geometries to evolve together
when the operational doctrine requires them to evolve independently.

**The red flag question:** "These two snapshots both have X — should we
DRY this up?"

**The correct response:** Duplicate the structure. The duplication is
intentional and acceptable per `/docs/doctrine/06-acceptable-inconsistency.md`.
If the duplication feels uncomfortable, the discomfort is the architecture
working as designed.

---

## D-02 — A new prop that selects between snapshot variants

**Pattern:** A contributor adds a prop like `variant`, `kind`, `type`,
or `flavor` to a component, with the values matching snapshot identifiers
or a category of operational failure.

**Why it is dangerous:** A variant prop is the seam along which a shared
renderer crystallizes. The first commit adds the prop with two values.
The second commit adds a third value. By the fifth value, the component
is the shared snapshot renderer that [C-03] forbids.

**The red flag question:** "What if we add a `snapshotType` prop?"

**The correct response:** No. The prop is forbidden by name and by
function. If the contribution requires conditional behavior between
snapshots, the conditional belongs inside the section that consumes
the snapshots, not inside a shared component. See F-05.

---

## D-03 — Storybook controls being added to snapshot stories

**Pattern:** A contributor improves a Storybook setup by adding
`argTypes` or `controls` to a snapshot story, exposing position,
text, or layout values for interactive editing.

**Why it is dangerous:** Storybook controls are a side-effect signal,
not the violation itself. Their presence indicates that the snapshot
component has props that vary its output. A snapshot that accepts
position or layout props is configurable, which is the property
[S-05] and [C-03] together forbid.

**The red flag question:** "Let's add controls so we can preview
different states of this snapshot."

**The correct response:** A snapshot has no different states. It
expresses one operational failure. The story renders it. If the
story benefits from controls, the snapshot is wrong, not the story.

---

## D-04 — A `variant` prop on `AnnotationLabel`

**Pattern:** A contributor adds a `variant` prop or a `kind` prop to
the annotation primitive to support two visually distinct annotation
treatments seen across snapshots.

**Why it is dangerous:** The primitive's three-prop API is bounded by
[C-06] and F-12. A fourth prop violates the API contract regardless
of what it is named or what it does. The primitive's narrowness is
load-bearing — see A2 in `02-approved-abstractions.md`.

**The red flag question:** "We need a different annotation style for
SN-04 — should the primitive accept a variant?"

**The correct response:** Render the different style inline within
SN-04 using raw SVG or HTML. The `AnnotationLabel` primitive remains
unchanged.

---

## D-05 — `position` derived from a function rather than declared as a literal

**Pattern:** A snapshot file replaces literal annotation positions with
calls to a positioning function:

```tsx
// FROM:
<AnnotationLabel position={{ x: 240, y: 96 }} text="..." />

// TO:
<AnnotationLabel position={annotationPosition('top-right', node1)} text="..." />
```

**Why it is dangerous:** The transformation is the path toward
algorithmic placement [F-11]. Literal positions are hand-authored
artifacts. Computed positions are a system. Once the system exists,
its rules become the authoring layer, and the operational specificity
of each placement is lost.

**The red flag question:** "Can we extract a helper for these positions?"

**The correct response:** No. Positions are coordinates. Coordinates
are literals. If a snapshot has many annotations, the snapshot file
gets long. That is acceptable.

---

## D-06 — `geometry-math.ts` accepting an object that looks like a graph

**Pattern:** A new function in the geometry math file with a signature
like:

```ts
export function placeAnnotation(node: Node, side: 'top' | 'right'): Point;
```

**Why it is dangerous:** The function knows about nodes. The math
utility is no longer pure math — it is a layout engine in disguise.
The next function will know about edges. The third will know about
hubs. The file will become the renderer that [C-03] forbids, with
the renderer's logic distributed across "utility" functions.

**The red flag question:** "This calculation is used in three snapshots,
should we move it to the utility?"

**The correct response:** Move the value-level math to the utility if
it is genuinely pure. Keep the structural logic — anything that knows
the values represent operational concepts — in the snapshot file.
See F-13 for the forbidden vocabulary list.

---

## D-07 — A spacing token used in more than one section's spacing prop

**Pattern:** Two sections declare the same spacing token:

```tsx
<SectionWrapper id="hero" spacing="standard">
<SectionWrapper id="friction" spacing="standard">
```

**Why it is dangerous:** The shared token is the first move toward
unified vertical rhythm [C-05]. Per A3, each section declares its own
named token (`spacing="hero"`, `spacing="friction"`). A shared
`"standard"` value is a violation of the token naming convention,
which exists specifically to prevent this drift.

**The red flag question:** "Hero and Friction have the same spacing
right now — can we just use one token?"

**The correct response:** They have the same value today, perhaps,
but they have different identities. The `hero` token and the
`friction` token are allowed to diverge tomorrow without changing
either section. A shared token would couple them.

---

## D-08 — Tailwind `@apply` consolidating styles across snapshot files

**Pattern:** A contributor moves repeated Tailwind class strings into
a single CSS class via `@apply`, applied across multiple snapshot files.

**Why it is dangerous:** Per [S-02], `@apply` consolidation across
snapshot or section files is presumed dangerous. The consolidation
creates a shared style boundary. Subsequent edits to the consolidated
class affect every consuming snapshot, which is the coupling the
architecture forbids.

**The red flag question:** "These four snapshots all use the same
five Tailwind classes — can we extract a `.snapshot-base` class?"

**The correct response:** No. The repetition is acceptable. If the
classes diverge in the future, the divergence happens per snapshot
without negotiation across files.

`@apply` within a single snapshot's scope, where the consolidation
does not cross snapshot boundaries, is permitted but rare.

---

## D-09 — A pull request that reduces total line count significantly

**Pattern:** A PR description says "this refactor reduces the codebase
by 320 lines."

**Why it is dangerous:** Significant line-count reduction in protected
directories is the signature of abstraction extraction. The lines do
not actually leave the codebase; they are folded into a shared component
or utility. The folding is the violation [F-17, S-01].

**The red flag question:** This is the question. The PR description is
the red flag.

**The correct response:** Per the stop-and-ask list in `QUICK-REFERENCE.md`,
a refactor that reduces line count by more than 20% in protected
directories requires governance review. Do not merge based on the
mechanical cleanliness of the change.

False positives exist: dead code removal, deleted comments, removed
unused imports. The review distinguishes between line removal that
deletes functionality and line removal that consolidates it.

---

## D-10 — Section files that all begin to look the same

**Pattern:** After several sections are built, a reviewer notices that
each section file has a similar shape: a wrapper component, a heading,
a body, a layout grid. The instinct is to extract a `Section` primitive.

**Why it is dangerous:** The shape similarity is partly artifact (the
sections are all sections) and partly drift (each section file is
adopting the shape of the previously written one). The extraction
solves the drift in the wrong direction by codifying it as architecture.

**The red flag question:** "All our sections have the same structure —
should we extract a `Section` component?"

**The correct response:** No. The legitimate shared construct is
`SectionWrapper`, which provides the container only. The internal
structure of each section is per-section. If the internal structures
have converged, that is itself a danger sign — see D-13.

---

## D-11 — A "minor cleanup" commit in a protected directory

**Pattern:** A commit titled "minor cleanup," "tidying up," "small
refactor," or "no functional changes" lands in `src/components/snapshots/`,
`src/components/sections/`, or `src/components/layout/`.

**Why it is dangerous:** Cleanup commits are the lowest-resistance
vector for normalization. The author does not perceive the change as
architectural. The reviewer does not flag it because nothing seems
wrong. The change accumulates with other cleanup commits over time
into a substantive normalization that no single PR ever proposed.

**The red flag question:** This category of commit is the red flag.

**The correct response:** Cleanup commits in protected directories are
reviewed against the doctrine, not against code-quality intuition. The
reviewer asks: did this cleanup remove an authored decision? If the
cleanup made spacing more uniform, weight more consistent, or annotations
more aligned, the answer is probably yes. The cleanup is rejected and
the discussion moves to whether the cleaned-up state was actually wrong.

---

## D-12 — A contributor citing engineering best practice as the rationale

**Pattern:** A PR description argues for a change on grounds of DRY,
SOLID, separation of concerns, single responsibility, or similar
engineering principles, without reference to the doctrine.

**Why it is dangerous:** These principles are correct in their domain.
This codebase has a layer in which they are correct (mandatory
consistency, per `06-acceptable-inconsistency.md`) and a layer in
which they produce the doctrine violation directly (load-bearing
inconsistency).

A PR that argues from engineering principle alone has not engaged with
the doctrine. The argument is not wrong — it is incomplete.

**The red flag question:** "This violates DRY — we should consolidate."

**The correct response:** DRY is correct in its layer. Cite which layer
this change applies to. If the layer is load-bearing inconsistency, DRY
is not the governing principle. If the layer is mandatory consistency,
DRY is. The doctrine answers which layer applies; engineering principle
alone does not.

---

## D-13 — Sections converging toward visual sameness

**Pattern:** Over time, sections that should feel distinct begin to look
similar in spacing, weight, density, or rhythm. No single change caused
this; the convergence emerged from many small decisions, each individually
defensible.

**Why it is dangerous:** Convergence is the failure mode of `04-scroll-psychology.md`.
The page's tension architecture depends on sections feeling different
from each other. If they converge, the scroll arc flattens, and the
emotional progression that the page is built around dissolves.

**The red flag question:** This pattern is detected at review of the
whole, not at review of a single PR. It surfaces at the doctrine
review checkpoints described in `06-review-checklist.md`.

**The correct response:** The doctrine reviewer asks: do the sections
still feel different? If a person scrolling the page from top to
bottom registers a flat experience, the convergence has happened.
The remediation is to identify which section needs to be re-authored
to restore the rhythm, not to apply a uniform fix across all sections.

---

## D-14 — A test that asserts visual stability

**Pattern:** A test is added that compares a snapshot's rendered output
to a stored screenshot or pixel hash, failing if they differ.

**Why it is dangerous:** [S-06] and F-06 forbid visual regression
testing on snapshots. The test creates organizational pressure to
preserve the current visual output. Authored artifacts evolve as the
operational doctrine sharpens. A test that fails when they evolve
forces them not to evolve.

**The red flag question:** "Let's add a screenshot test for SN-01 to
prevent regression."

**The correct response:** No. Functional tests, accessibility tests,
and content presence tests remain in scope. Visual diffing does not.

---

## D-15 — Mobile responsive utilities applied to SN-02, SN-05, or SN-06

**Pattern:** A contributor implements mobile support for SN-02 by
adding Tailwind responsive prefixes (`md:`, `lg:`) inside the desktop
file rather than authoring `SN-02.mobile.tsx` separately.

**Why it is dangerous:** [C-04] requires these three snapshots to be
separately authored on mobile. Responsive prefixing produces a
scaled-down desktop, which the doctrine forbids. The desktop file
remains the authoring artifact and the mobile experience becomes a
derivative.

**The red flag question:** "I added `md:hidden` and `block md:flex`
to make SN-05 work on phones."

**The correct response:** Revert. Author `SN-05.mobile.tsx` from
the operational ground truth on mobile. The composition layer
selects between the two files based on viewport.

For SN-01, SN-03, SN-04, SN-07, responsive prefixing is permitted.
The decision tree is in `05-snapshot-authoring-protocol.md`.

---

## D-16 — A commit message containing forbidden vocabulary

**Pattern:** A commit message contains `normalized`, `standardized`,
`unified`, `harmonized`, `consolidated`, `reusable`, `simplified`,
`consistent`, `consistency`, or `cleanup`.

**Why it is dangerous:** Per `inverted-vocabulary.md`, these words
typically indicate operational erosion in this codebase. The commit
scanner flags them automatically.

**The red flag question:** The commit message itself is the red flag.

**The correct response:** The flag is not a block. It is a signal to
verify. The reviewer asks: does this change actually normalize
something that should be authored? If yes, the change requires
doctrine review before merging. If no, the vocabulary hit was
coincidental and the commit proceeds.

The reviewer does not approve a flagged commit on the basis that
"the words don't actually mean that here." They approve on the basis
that the change has been verified against the doctrine and is
governance-compliant.

---

## How to use this document at review time

A reviewer working through a PR in a protected directory should scan
this document's pattern names against the diff. The patterns are
listed in approximate order from "most likely to be a real violation"
to "most likely to be a false positive."

A PR that exhibits one danger sign requires a verification note in
the review. A PR that exhibits two or more requires escalation to
governance review per `07-when-to-stop-and-ask.md`.

Danger signs are not exhaustive. The patterns above are the most
common ones observed at the doctrine stabilization phase. New
patterns will emerge during implementation. When a new pattern is
identified, it is added to this document with the same structure.

---

## Verification

This document is heuristic and is reviewed manually. There is no
mechanical check that a PR exhibits a danger sign. The mechanical
layer catches the outcomes (the actual violations); this document
catches the trajectories before they land.

---

## Assumptions and unresolved dependencies

- The protected directories list (`src/components/snapshots/`,
  `src/components/sections/`, `src/components/layout/`) is consistent
  with `01-forbidden-refactors.md`. If those paths change, this
  document must update.
- The 20% line-count threshold in D-09 matches the threshold in
  `QUICK-REFERENCE.md`. If one changes, both must.
