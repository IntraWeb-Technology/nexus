# Inverted vocabulary

**Onboarding tier:** 30-minute operational understanding
**Severity:** STRUCTURAL — commit scanner watches for these terms

---

## The inversion

In most codebases, the following words indicate engineering maturity:

`normalized` `standardized` `unified` `harmonized` `consolidated`
`reusable` `simplified` `consistent` `consistency` `cleanup`

In this repository, these words frequently indicate operational erosion.

Both statements are true. The difference is that this codebase is governed
by perceptual doctrine that requires authored unevenness to survive in
specific layers. Standard engineering practice treats unevenness as
a problem to be solved. This doctrine treats it as load-bearing architecture.

This is not a claim that good engineering is wrong.
It is a claim that good engineering optimizes for the wrong target in
specific layers of this codebase.

---

## What each word typically means here

| Word in a commit message | What it usually means in this repo |
|--------------------------|-------------------------------------|
| "normalized spacing" | Per-section spacing variance was lost |
| "normalized snapshot layout" | Snapshot asymmetry was converted to configuration |
| "standardized section padding" | Intentional rhythm differences were erased |
| "unified annotation positioning" | Hand-placed labels were replaced with an algorithm |
| "harmonized section rhythm" | Scroll psychology tension curve was flattened |
| "consolidated snapshot rendering" | Authored artifacts were replaced with a rendering system |
| "reusable diagram component" | Snapshot independence was broken |
| "simplified annotation system" | Operational specificity was abstracted away |
| "consistent spacing across sections" | Load-bearing variance was treated as drift |
| "cleanup: normalize component structure" | Multiple CRITICAL violations in one commit |

---

## Where the inversion does not apply

The inversion is layer-specific. These areas require standard consistency
and the vocabulary above carries its normal meaning:

- Accessibility semantics (ARIA, focus management, keyboard behavior)
- Typography primitive scales
- Color token definitions
- Interaction behavior (hover, focus, link states)
- Code formatting and linting
- Build and deployment configuration
- Test patterns outside snapshot visual regression

If a commit message says "standardized focus ring behavior," that is normal.
If it says "standardized snapshot layout," that is erosion.
The word is the same. The layer determines the meaning.

---

## How to proceed when the scanner flags your commit

The scanner warning is not a block. It is a signal to pause and verify.

Ask: does this change normalize something that is supposed to be authored?

- If no: proceed. The vocabulary hit was coincidental.
- If yes: the change needs doctrine review before merge.
- If unsure: open a governance issue. Do not proceed until resolved.

The scanner produces false positives. A commit message like
"consistent with snapshot authoring protocol" will flag "consistent"
even though the change is governance-compliant. Use judgment.
The scanner surfaces the question. You answer it.