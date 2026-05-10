# Doctrine 06 — Acceptable inconsistency

**Layer:** Doctrine (Layer 3)
**Onboarding tier:** Deep doctrine understanding
**Required reading for:** Governance reviewers, doctrine authors,
anyone making a judgment call about whether unevenness is intentional.

---

## Opening principle

Inconsistency is not the enemy of quality in this system.
Accidental inconsistency is.

The distinction is whether the unevenness was authored or whether it leaked in.
An experienced engineer arriving at this codebase will instinctively interpret
authored unevenness as technical debt, unfinished alignment, or bad abstraction
hygiene. That interpretation is wrong in specific layers, and this document
defines exactly where.

---

## Load-bearing inconsistency

These areas require unevenness. Normalizing them is a doctrine violation.

**Snapshot geometry**
Each snapshot expresses a specific operational failure condition through
specific geometry. The asymmetry between snapshots is accuracy, not
coincidence. A shared rendering system that produces consistent geometry
across snapshots is producing inaccurate representations. Inconsistency
here is required by the recognition doctrine.
Reference: `/docs/doctrine/02-snapshot-doctrine.md`

**Section spacing rhythm**
Sections do not share uniform vertical spacing. The Friction section breathes.
The Proof section compresses. The Model section opens. These are not
approximations waiting to be standardized — they are the tension and
decompression mechanics of the scroll arc. Uniform spacing collapses
the emotional progression.
Reference: `/docs/doctrine/04-scroll-psychology.md`

**Annotation positioning within snapshots**
Annotations are hand-placed per artifact. Their positions express the
specific relationship between the label and the operational condition
it names. Algorithmic placement produces consistent but inaccurate
positioning. Inconsistency here preserves specificity.
Reference: `/docs/doctrine/02-snapshot-doctrine.md`

**Visual weight imbalance**
The Filter section's Not For column is heavier than the For column.
The Friction list has irregular line lengths. The Hero is asymmetric.
These imbalances are not unfinished alignment. They are authored to
produce specific perceptual effects. Balancing them removes the effect.
Reference: `/docs/doctrine/03-environmental-doctrine.md`

**Mobile reconstruction geometry**
SN-02, SN-05, and SN-06 are entirely different artifacts on mobile.
They do not share geometry with their desktop counterparts. This
inconsistency between viewport versions is the correct behavior.
Reference: `/implementation-governance/05-snapshot-authoring-protocol.md`

**Typography weight variance across sections**
The Argument band and Proof section use typographic weight differently
than other sections. This is intentional. The weight shifts are part of
the contrast and rupture mechanics. Standardizing weight usage across
all sections flattens those mechanics.
Reference: `/docs/doctrine/03-environmental-doctrine.md`

---

## Mandatory consistency

These areas require consistency. Unevenness here is a defect, not doctrine.

**Accessibility semantics**
ARIA attributes, focus management, keyboard navigation, and screen reader
behavior must be consistent and correct throughout. No doctrine exception.

**Typography primitive scales**
The heading scale, body size, and monospace label component must be
consistent across the codebase. Per-section weight variance is allowed.
Per-section font-size variance is not.

**Color token definitions**
The locked palette must be applied consistently. No section invents
off-palette colors. No snapshot uses hardcoded hex values outside of
the approved design token set.

**Interaction behavior**
Hover states, focus states, link behavior, and button behavior must be
consistent. Users should not encounter different interaction patterns
in different sections.

**Code quality**
Linting, formatting, type safety, and test patterns apply uniformly.
The doctrine does not exempt snapshot files from TypeScript correctness
or accessibility requirements.

**Build and deployment behavior**
No section or component may introduce build instability.

---

## The diagnostic questions

**When you encounter unevenness and are not sure if it is load-bearing:**

Ask: does this unevenness express something operational that consistency
would erase?

- If yes: it is load-bearing. Do not normalize it.
- If no: it is probably drift. Fix it.

**When you encounter consistency in a layer that should be uneven:**

Ask: was this authored evenly, or was it normalized?

- Authored evenness is rare but legitimate. It means someone deliberately
  chose equal spacing or weight and can justify why.
- Normalized evenness is the failure mode. It means a standard engineering
  reflex removed variance that should have survived.

If you cannot tell which it is, open a governance issue before merging.

---

## Why this document exists

Future maintainers will continuously interpret authored asymmetry as
unfinished work. That interpretation is reasonable from a standard
engineering frame. It is wrong in the specific layers this document
defines.

This document exists to give reviewers a rebuttal that is not based
on taste or preference. The rebuttal is structural: this unevenness is
load-bearing because it preserves a specific perceptual effect that
consistency would erase. That is an engineering argument, not an
aesthetic one.

When a PR normalizes something in the load-bearing list above,
the rejection is not "this feels wrong." It is "this change removes
a deliberate architectural property. Here is the doctrine reference.
Here is what was lost."