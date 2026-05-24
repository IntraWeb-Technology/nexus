# Acceptable inconsistency

**Layer:** Implementation governance.
**Audience:** Anyone reviewing, refactoring, or merging code in this repository.
**Authority:** Lists every place where evenness is forbidden and every place where it is required. No exceptions outside this document.

When the codebase looks uneven, this document tells you whether to leave it alone or fix it.

---

## Inconsistency that must not be removed

The following unevenness is authored. Normalizing it is a violation.

**Snapshot geometry across SN-01 through SN-07**
Each snapshot file has its own geometry. They do not share rendering logic. They do not import from each other. They do not produce visually consistent output. A PR that introduces a shared geometry system, a shared snapshot renderer, or visual consistency between snapshots is rejected.
Reference: CRITICAL rules C-01, C-02, C-03.

**Section spacing tokens**
Each section has its own vertical spacing token. The Friction, Proof, and Model sections do not use the same spacing value. A PR that unifies spacing across sections, applies a default spacing token to multiple sections, or removes per-section spacing variance is rejected.
Reference: CRITICAL rule C-05.

**Annotation placement within snapshots**
Labels in snapshot files are placed by explicit `position` values. They are not placed by an algorithm. They are not aligned to a grid. They do not share placement logic between snapshots. A PR that introduces an automatic positioning system, a shared annotation layout, or an `anchor()`-style placement utility is rejected.
Reference: CRITICAL rule C-06.

**Filter section column weight**
The Not For column is visually heavier than the For column. A PR that equalizes the columns, applies the same styling to both, or removes the weight imbalance is rejected.
Reference: CRITICAL rule C-07.

**Friction section list item line lengths**
Friction list items have irregular line lengths. They are not padded, trimmed, or aligned to a common right edge. A PR that balances line lengths, applies a `minHeight` to equalize cells, or two-columns the list to pair items by length is rejected.
Reference: Contract Section 3.

**Hero section alignment**
The Hero is left-weighted, not centered. A PR that centers the Hero, applies symmetric padding, or balances its visual weight horizontally is rejected.
Reference: Contract Section 3.

**Mobile snapshot files for SN-02, SN-05, SN-06**
These three snapshots have separate mobile files with their own geometry. Mobile files do not share layout with their desktop counterparts. A PR that replaces a mobile file with a responsive variant of the desktop file, or that adds `md:hidden` / `block md:flex` responsive logic to the desktop file as a mobile substitute, is rejected.
Reference: CRITICAL rule C-04.

**Argument band background and boundary**
The Argument band has a different background than surrounding sections. Its top and bottom boundaries are abrupt. A PR that softens the band's boundaries with gradients, fades, or transitions, or that applies the band's background treatment to other sections, is rejected.
Reference: CRITICAL rule C-08.

**Typography weight in Argument and Proof sections**
The Argument band and Proof section use typographic weight differently than other sections. A PR that standardizes weight usage across all sections is rejected.

---

## Inconsistency that must be removed

The following must be uniform throughout the codebase. Unevenness here is a defect, not doctrine.

**Typography font sizes**
The heading scale, body text size, and monospace label size are defined once and applied consistently. Per-section weight variance is allowed (see above). Per-section font-size variance is not. A PR that introduces section-specific font sizes outside the primitive scale is rejected.

**Color tokens**
Colors come from the locked palette defined in `tailwind.config.ts`. No section invents off-palette colors. No component uses hardcoded hex values outside the approved token set. A PR that adds inline colors or section-specific palettes is rejected.

**Accessibility semantics**
ARIA attributes, focus management, keyboard navigation, and screen reader behavior are consistent throughout. No section is exempt from accessibility requirements regardless of any other property in this document.

**Interaction patterns**
Where interactions exist (links, buttons, form controls), their behavior is consistent across sections. Users do not encounter different button behaviors or different focus styles in different sections. Note: this is about behavior consistency where interaction exists. It is not a license to add hover states or transitions where the contract forbids them.

**Code quality**
TypeScript correctness, ESLint compliance, formatting, and test patterns apply uniformly. Snapshot files are not exempt from type safety or linting.

**Build and deployment behavior**
No section, component, or snapshot may introduce build failures, hydration errors, or deployment instability.

---

## When you are not sure

**Case 1: You see unevenness and do not know if it is authored.**

Check whether the property appears in the "Inconsistency that must not be removed" list above. If yes: do not change it. If no: check the contract and `QUICK-REFERENCE.md`. If it does not appear in either: open a governance issue. Do not resolve it yourself.

**Case 2: You see consistency in a layer where this document says there should be unevenness.**

The consistency may be authored (someone deliberately matched the values and has a reason) or it may be drift (a previous PR normalized something that should have varied). Open a governance issue. Note the location and the rule. Do not assume.

**Case 3: A standard engineering practice you would normally apply seems to violate this document.**

The practice is wrong for this repository in that specific location. Do not apply it. If you believe the practice is genuinely necessary, open a governance issue rather than working around the rule.

---

## What this document does not cover

This document covers only the load-bearing inconsistency and mandatory consistency rules. It does not cover:

- Per-section build rules. Those are in `04-section-specific-warnings.md`.
- Snapshot construction rules. Those are in `05-snapshot-authoring-protocol.md`.
- Forbidden refactor patterns. Those are in `01-forbidden-refactors.md`.
- Approved abstractions. Those are in `02-approved-abstractions.md`.

If you are reviewing a change that touches a property on either list above, read this document together with the relevant rule document.

---

## When a rule in this document seems wrong

It probably isn't. The rules here are derived from production decisions that have already been made. They are not preferences.

If you believe a rule is genuinely wrong for your case, open a governance issue and wait for a doctrine reviewer. Do not work around the rule, do not propose a "minor exception," and do not resolve the question yourself.
