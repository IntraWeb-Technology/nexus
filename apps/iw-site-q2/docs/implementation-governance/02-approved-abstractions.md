# 02 — Approved abstractions

**Onboarding tier:** 30-minute operational understanding
**Severity:** STRUCTURAL — adding to this list requires governance review
**Authority:** This document is the complete and exclusive list of permitted
shared constructs in the codebase. Anything not listed here is not approved.

---

## Why this list is closed

The architecture is frozen because every approved abstraction was evaluated
against a single question: does this abstraction normalize something the
doctrine requires to remain authored?

The five abstractions below survived that test. Each has a narrow API. Each
is bounded by behavior that explicitly excludes operational vocabulary.

A sixth abstraction is not added because of convenience, code reduction,
or perceived cleanliness. A sixth abstraction is added only when implementation
exposes a real failure that the current set cannot resolve and a doctrine
reviewer confirms the new abstraction does not collapse a load-bearing
property.

This list is not aspirational. It is operational. If a contribution requires
a sixth abstraction, the contribution is wrong about what it requires until
proven otherwise.

---

## A1 — Typography primitives

**Path:** `src/components/primitives/typography.tsx`

**Purpose:** Provides the canonical heading scale, body size, and monospace
label component. Ensures typographic consistency across sections in the
layer where consistency is mandatory (per `06-acceptable-inconsistency.md`).

**API surface:**

```tsx
export const Heading: React.FC<{
  level: 1 | 2 | 3;
  children: React.ReactNode;
}>;

export const Body: React.FC<{
  children: React.ReactNode;
}>;

export const Annotation: React.FC<{
  children: React.ReactNode;
}>;

export const SystemLabel: React.FC<{
  children: React.ReactNode;
}>;
```

**Forbidden expansions:**

- Variant props that select between operational tones
- A `weight` prop on `Heading` (weight variance is per-section authored,
  not a primitive concern)
- A `size` prop on `Body` (the body scale is a single value)
- Style props that allow callers to override the underlying scale

**Why the API is this narrow:**

Per `03-environmental-doctrine.md`, three active type levels exist in any
section, plus a fourth level (system label) within diagram contexts. The
primitive surface mirrors that doctrine exactly. Adding a fifth level or
allowing arbitrary scaling would let any section invent its own typography
scale, which collapses the consistency this primitive exists to preserve.

**Per-section weight variance:**

Weight variance across sections is intentional. The Argument band uses
weight differently than the Friction list. This variance is implemented
inside the section file using Tailwind utility classes on the `Heading`
output, not by adding props to the primitive.

---

## A2 — Annotation label

**Path:** `src/components/snapshots/_primitives/AnnotationLabel.tsx`

**Purpose:** Renders a positioned text label inside a snapshot's SVG.
Ensures consistent typographic treatment of annotations across snapshots
without algorithmic positioning.

**API surface:**

```tsx
export const AnnotationLabel: React.FC<{
  position: { x: number; y: number };
  text: string;
  weight?: 'primary' | 'secondary';
}>;
```

**That is the entire API. There is no fourth prop.**

**Forbidden expansions:** see F-12 in `01-forbidden-refactors.md` for the
complete list of prop names that may not be added.

**Why this primitive is permitted:**

The typographic treatment of annotations (font, size, monospace, color)
must be consistent across snapshots. This is a mandatory consistency
layer per `06-acceptable-inconsistency.md`.

The position of annotations must be inconsistent across snapshots,
expressing the specific spatial relationship in each artifact. This
is a load-bearing inconsistency layer per the same document.

A primitive that handles typography while accepting raw position values
satisfies both constraints. The author hand-places by passing exact
coordinates. The primitive guarantees the label looks like every other
label in the system.

**The `_primitives` directory:**

The directory `src/components/snapshots/_primitives/` is permitted. It
is distinct from the forbidden `src/components/snapshots/_shared/`.
The distinction matters:

- `_primitives` contains primitives whose API explicitly excludes
  operational vocabulary. Currently: `AnnotationLabel.tsx`. Period.
- `_shared` would contain rendering logic that knows about snapshots
  as a category. The directory is forbidden because the category-aware
  rendering it would house is the violation.

Adding a second file to `_primitives` requires governance review.

---

## A3 — Section wrapper

**Path:** `src/components/layout/SectionWrapper.tsx`

**Purpose:** Provides per-section spacing tokens, semantic landmarks,
and the optional environmental rupture treatment for the Argument band.
Does not enforce uniform vertical rhythm.

**API surface:**

```tsx
export const SectionWrapper: React.FC<{
  id: SectionId;
  spacing: SectionSpacingToken;
  rupture?: 'argument-band';
  children: React.ReactNode;
}>;

type SectionId =
  | 'hero'
  | 'friction'
  | 'argument'
  | 'pillars'
  | 'proof'
  | 'model'
  | 'continuity'
  | 'filter'
  | 'cta';

type SectionSpacingToken =
  | 'hero'
  | 'friction'
  | 'argument'
  | 'pillars'
  | 'proof'
  | 'model'
  | 'continuity'
  | 'filter'
  | 'cta';
```

**The crucial property:** the spacing token is per-section, not a scale.
There is no `spacing="standard"` value. Each section declares its own
named token. The Tailwind config defines what each token resolves to,
and those resolutions are intentionally not uniform.

**Forbidden expansions:**

- A `padding` prop accepting arbitrary spacing values
- A default value for `spacing` (forces explicit per-section declaration)
- A `variant` prop that bundles spacing presets across sections
- Generic spacing tokens like `'sm'`, `'md'`, `'lg'`, `'standard'`, `'none'`

**The rupture prop:**

`rupture="argument-band"` applies the dark-band treatment for the Argument
section only. The prop value is a literal section name, not a generic
"dark" mode, because the Argument band is the only environmental rupture
in the page (per `03-environmental-doctrine.md`). A second value would
imply a second rupture, which the doctrine forbids.

If a future doctrine change introduces a second rupture, the prop accepts
a second literal value at that time. It does not become a generic mode.

**What this wrapper does not do:**

- It does not lay out content within the section
- It does not apply typography
- It does not set the section background color (the Argument band is the
  exception, handled via `rupture`)
- It does not handle scroll behavior, intersection observation, or
  any other behavioral concern

A section file is responsible for its own internal layout. The wrapper
provides the container, the semantic landmark, and the spacing token.
That is all.

---

## A4 — Color tokens

**Path:** `tailwind.config.ts`

**Purpose:** Locks the page palette. Provides design tokens that are
used everywhere a color is rendered.

**Surface:**

The Tailwind theme defines:
- `colors.bg.*` — background tokens
- `colors.fg.*` — foreground tokens
- `colors.accent.*` — accent tokens (Argument band, scan anchors)
- `colors.border.*` — border tokens

**Forbidden in the same file:**

- Spacing tokens that purport to be a unified scale across sections
- Typography tokens beyond the primitive scale
- Layout tokens of any kind

The Tailwind config is the design token boundary. Color tokens are
mandatory consistency. Layout tokens would be load-bearing inconsistency
disguised as configuration. Keep them out.

**No hardcoded hex values in component files:**

Snapshot files, section files, and primitive files use Tailwind classes
or design tokens exclusively. A hex value in a `.tsx` file is a defect.
The exception is intentional and rare: a one-off color used inside a
single snapshot to express something the palette does not cover.
That exception requires a governance issue before merging.

---

## A5 — Geometry math

**Path:** `src/lib/geometry-math.ts`

**Purpose:** Pure mathematical utilities for SVG geometry. Distance,
angle, intersection, bezier control point calculation, viewBox arithmetic.

**API surface:**

The file exports pure functions whose signatures contain only:
- `number` parameters
- `{ x: number; y: number }` parameters
- Return values of the same shapes

Examples:

```ts
export function distance(a: Point, b: Point): number;
export function midpoint(a: Point, b: Point): Point;
export function angle(a: Point, b: Point): number;
export function bezierControlPoint(start: Point, end: Point, curvature: number): Point;
```

**Forbidden in this file:**

See F-13 in `01-forbidden-refactors.md` for the complete list of
forbidden parameter and function names. The summary: any parameter
or function name that references operational concepts (node, edge,
hub, annotation, snapshot, layout, section) is forbidden.

**Why this distinction matters:**

A function named `distance(a, b)` is value-level math. It cannot be
contaminated by snapshot-specific assumptions because it does not
know what the values represent.

A function named `distanceBetweenNodes(nodeA, nodeB)` knows about
nodes. Once nodes exist as a concept in this file, edges follow,
then layouts, then a renderer. The vocabulary is the gravitational
well that produces the violation.

**Size threshold:**

If this file exceeds 200 lines, an audit is required (S-04).
The threshold is heuristic. The actual signal is whether the file
has accumulated structural logic that belongs inside snapshot files.

---

## What is not on this list

The following are sometimes proposed and remain unapproved:

**A shared snapshot rendering component** — forbidden by [C-03].
Doctrine: each snapshot is an independently authored artifact.

**A diagram primitive set** (Node, Edge, Hub) — forbidden by [C-03].
Doctrine: the geometry of each snapshot expresses its operational meaning;
shared primitives would normalize geometry.

**A section primitive set** (SectionHeading, SectionBody, SectionLayout) —
unapproved. The typography primitives in A1 cover heading and body needs.
Layout within a section is the section file's responsibility.

**An animation utility** — unapproved. Per `03-environmental-doctrine.md`,
the page has near-zero motion. The utility does not exist because the
need does not exist.

**A motion primitive for scroll-tied behavior** — unapproved. Scroll-tied
behavior must be reviewed against the scroll psychology doctrine before
implementation; a primitive would precede that review.

**A responsive helper or breakpoint utility** — unapproved. Mobile
snapshots for SN-02/SN-05/SN-06 are separate files, not responsive
variants. For other elements, Tailwind responsive prefixes are sufficient.

**A theme provider or design system runtime** — unapproved. The Tailwind
config is the design system. No runtime is required.

---

## Adding a new abstraction (process)

The architecture is frozen. Adding a sixth abstraction is rare. The
process is:

1. Open a governance issue describing the failure the existing five
   abstractions cannot resolve.
2. Document the doctrine property the proposed abstraction would
   preserve, not collapse.
3. Document the proposed API surface and the forbidden expansions
   that bound it.
4. Wait for doctrine review. Do not begin implementation.
5. If approved, the abstraction is added to this document with the
   same structure as A1–A5 before any code is written.
6. The PR introducing the abstraction references the governance issue
   and the updated section of this document.

A PR that introduces a new shared file in a protected directory without
having gone through this process is rejected at the structural layer
([S-01]) regardless of the file's quality.

---

## Verification

Mechanical:

- ESLint enforces the import boundary for each path above
- CODEOWNERS protects the files at these paths
- The PR template asks whether the change adds to this list

Manual review:

- A new file in `src/components/`, `src/lib/`, or `src/styles/`
  must be matched against this list at PR review time
- A change to an API surface in the list above requires governance
  approval, not just maintainer approval

---

## Assumptions and unresolved dependencies

- The five paths above are the canonical paths; if a project decision
  relocates any of them, this document must be updated before the
  relocation merges.
- The `SectionId` and `SectionSpacingToken` enums assume the section
  list noted at the top of the bundle. If section names change, both
  enums must update together.
- The Tailwind config path assumes a single root config; if the project
  adopts a multi-config structure, A4 must be updated to reflect which
  file is the design token boundary.
