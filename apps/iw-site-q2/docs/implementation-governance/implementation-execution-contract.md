# Implementation Execution Contract v1.1

**Audience:** Cursor and any implementation contributor.
**Authority:** This document governs what may be built. It does not explain why.
**Reading time:** 15 minutes. Read completely before opening any file.

When this document conflicts with an instinct to improve, clean up, or optimize: this document wins.

**v1.1 amendment (post-audit):** Path references updated from `src/components/` to `components/` and `src/lib/` to `lib/` to match the existing repository layout. No constraints changed. The directory prefix is not load-bearing; the structural rules are. References to "Phase 1" remain in the document; in the convergence retrofit, treat these as describing the scaffolding state the codebase is being brought toward, applied incrementally per the approved remediation plan rather than as a clean-slate build phase.

---

## Section 1 — Build Authority

**Cursor implements only what is explicitly defined here or in the referenced governance files.**

Cursor does not:
- reinterpret instructions,
- infer intent from context,
- improve what is not broken,
- resolve ambiguity with a design decision,
- apply standard frontend best practice where it conflicts with this document.

If a required behavior is not explicitly stated, leave a placeholder comment and stop. Do not fill the gap.

If a section of this document seems wrong for your specific case, stop and ask. Do not resolve it yourself.

The governance files referenced throughout this document are authoritative. This contract summarizes them for build execution. When the summary is insufficient, read the referenced file.

---

## Section 2 — Phase 1 Allowed Work

Phase 1 builds the structure only. No content. No visual polish. No completed sections.

**Allowed in Phase 1:**

- Repository file and directory structure
- Route definitions (Next.js App Router or Pages — confirm with operator before choosing)
- Section shell components (empty containers with correct identifiers)
- Typography primitives at `components/primitives/typography.tsx`
- `SectionWrapper` at `components/layout/SectionWrapper.tsx` with per-section spacing tokens
- Tailwind color token configuration in `tailwind.config.ts`
- Dark-band shell for the Argument section (background only, no content, no transition smoothing)
- Snapshot file stubs — one file per snapshot (SN-01 through SN-07), empty, correctly named, no shared logic
- `AnnotationLabel` primitive at `components/snapshots/_primitives/AnnotationLabel.tsx`
- ESLint import rule enforcing snapshot file independence
- Commit scanner for forbidden vocabulary
- CODEOWNERS for protected directories
- PR template with required governance fields
- Mobile snapshot file stubs for SN-02, SN-05, SN-06 — separate files, not responsive variants
- `lib/geometry-math.ts` — value-level math utilities only

**That is the complete list.** If a task is not on this list, it is not Phase 1 work.

---

## Section 3 — Forbidden Phase 1 Work

Do not do any of the following, regardless of how straightforward they appear:

**Copy and content:**
- Do not write, rewrite, or adjust any copy. Use placeholder text that is visually obvious as a placeholder (`[HERO HEADLINE — DO NOT EDIT]`, not Lorem Ipsum).
- Do not move copy from the handoff document into components. Copy is locked in the handoff. It goes in during a designated copy pass, not during structural scaffolding.

**Visual polish:**
- Do not add hover states.
- Do not add transition animations on any element.
- Do not add entrance animations.
- Do not add scroll-triggered effects.
- Do not add decorative shadows, gradients, or border treatments not explicitly specified.

**Layout and spacing:**
- Do not normalize spacing across sections. Each section has its own spacing token. Uniform rhythm is forbidden.
- Do not center the Hero section. It is left-weighted. Do not adjust this.
- Do not balance the Friction section's list item line lengths. They are irregular by design.
- Do not equalize the Filter section's two columns. The left column (Not For) is heavier than the right column (For). Do not adjust this.

**Component architecture:**
- Do not create a shared snapshot renderer of any kind.
- Do not create a generic `Card` component and use it for proof cards, friction items, or process steps.
- Do not extract shared geometry logic into a rendering component. `geometry-math.ts` handles values only.
- Do not create an abstraction not on the approved list in Section 5.
- Do not create a `snapshots/index.tsx` that maps snapshot IDs to shared component instances.

**Responsive behavior:**
- Do not implement responsive scaling for SN-02, SN-05, or SN-06. These snapshots require separate mobile files. Stub them as empty files. Do not attempt implementation.
- Do not add `md:hidden` / `block md:flex` responsive logic to snapshot files. That approach is forbidden.

**Proof section:**
- Do not implement the Proof section in Phase 1. Stub it as an empty shell. Full governance for the Proof section is in `/docs/governance/05-proof-section-governance.md` and must be read before any Proof section work begins.

**Inferences:**
- Do not convert any doctrine language into a design decision. If a governance document uses language you are not sure how to implement, leave a placeholder and ask.
- Do not make any architectural decision not explicitly covered by this document or the referenced governance files.

---

## Section 4 — No-Interpretation Rule

**If the required behavior is not explicit, do not infer it.**

This rule has no exceptions.

When you encounter an ambiguous instruction:
1. Do not make a decision.
2. Do not make a reasonable guess.
3. Leave a placeholder comment in the exact format: `// [IMPLEMENTATION HOLD — {description of what is unclear}]`
4. Continue with work that is not ambiguous.
5. List all holds in your PR summary.

**You will encounter governance documents that use explanatory language.** That language is for doctrine authors, not for implementation. Do not convert explanatory language into design decisions. If a governance document says something that sounds like a design direction but does not name a specific required or forbidden behavior, it is not an implementation instruction. Flag it and ask.

---

## Section 5 — Approved Abstractions

These are the only shared constructs permitted in this codebase. Nothing else may be shared.

| Name | Path | What it does | What it must not do |
|------|------|--------------|---------------------|
| Typography primitives | `components/primitives/typography.tsx` | Heading scales, monospace label component | Must not enforce section-level spacing |
| Annotation label | `components/snapshots/_primitives/AnnotationLabel.tsx` | Renders a positioned text label | Props: `position`, `text`, `weight` only. Must not accept layout or geometry props. Must not position itself automatically. |
| Section wrapper | `components/layout/SectionWrapper.tsx` | Accepts per-section spacing tokens | Must not enforce uniform vertical rhythm. Must not default to a shared spacing value. Each section passes its own token. |
| Color tokens | `tailwind.config.ts` | Locked color palette | Must not include layout tokens. Colors only. |
| Geometry math | `lib/geometry-math.ts` | SVG value-level calculations | Must not contain functions whose signatures use structural vocabulary: `node`, `edge`, `hub`, `annotation`, `snapshot`, `layout`. Those belong in the authored artifact, not here. |

**Duplication outside this list is acceptable.** Two snapshot files that share a similar structure do not need a shared component. They stay separate. Duplication is intentional. Abstraction is not.

---

## Section 6 — Protected Areas

The following areas require explicit human approval before any change. Do not modify them unilaterally.

**Snapshot files (`components/snapshots/`):**
Each snapshot is a standalone authored file. SN-01 through SN-07 do not share rendering logic. They do not import from each other. Changes to snapshot files require governance review. In Phase 1, snapshot files are stubs — do not implement their contents.

**Proof section:**
Empty shell in Phase 1. Full governance at `/docs/governance/05-proof-section-governance.md`. Do not begin implementation without reading that file and receiving explicit instruction.

**Section spacing tokens:**
Each section's spacing is independent. Do not change spacing in more than one section in a single commit. Any change to spacing tokens across sections requires governance review.

**Argument band (dark section, Section 3):**
Background only in Phase 1. The boundary at the top and bottom of this band must be abrupt. No gradient. No fade. No transition animation into or out of this section. Do not add content until explicitly instructed.

**Filter section columns:**
Not For column is heavier than For column. Do not equalize them. Do not adjust their relative weights.

**Annotation placement:**
Labels in snapshot files are hand-placed. Do not create a positioning system that places them algorithmically. `AnnotationLabel` receives explicit `position` values. It does not calculate its own position.

**Mobile snapshot files (SN-02, SN-05, SN-06):**
Separate files, not responsive variants. In Phase 1: create empty stub files at the correct paths. Do not implement. Do not use responsive Tailwind prefixes as a substitute.

---

## Section 7 — Stop-and-Ask Triggers

Stop immediately and open a governance issue when you encounter any of the following. Do not proceed until you receive a response.

- You are about to create a new shared component not on the approved list in Section 5.
- A refactor you are considering would reduce total line count in a protected directory by more than 20%.
- A single commit would touch more than one protected directory.
- You are about to add any spacing token that applies to more than one section.
- You are about to change the `AnnotationLabel` API.
- You want to add a prop to `SectionWrapper` that would produce uniform rhythm.
- You have encountered a governance document instruction that seems wrong for your specific case.
- You are about to make any decision not explicitly covered by this document.
- You want to add any animation, transition, or scroll behavior.
- You want to write copy or adjust placeholder text to look more finished.
- You are about to create any new file in `components/` that does not match an approved pattern.

**The procedure:** Open a GitHub issue tagged `governance-question`. State the specific decision you need to make. Wait for a response. Do not resolve it yourself.

---

## Section 8 — Forbidden File and Component Names

Creating any of the following is a critical violation. The build must stop.

**Forbidden filenames:**
- `Snapshot.tsx` / `Snapshot.ts`
- `DiagramNode.tsx` / `DiagramEdge.tsx` / `DiagramHub.tsx`
- `DiagramRenderer.tsx` / `SnapshotRenderer.tsx` / `RenderSnapshot.tsx`
- `snapshots/index.tsx` that maps IDs to a shared component
- Any file inside `snapshots/_shared/`

**Forbidden component patterns:**
- Any component with a prop named `snapshotType`, `diagramKind`, or `layoutVariant`
- Any component that renders different snapshot geometries based on a prop value
- Any wrapper that applies uniform spacing to multiple sections via a default value

---

## Section 9 — Forbidden Vocabulary in Code

Do not use the following terms in component names, prop names, file names, comments, or PR descriptions:

- `perceptualArchitecture` / `perceptual-architecture` / "perceptual architecture"
- `recognitionCorridor` / "recognition corridor"
- `compoundingRecognition` / "compounding recognition"
- `scrollPsychology` / "scroll psychology"
- `environmentalSignaling` / "environmental signaling"
- `operationalIntelligenceEnvironment` / "operational intelligence environment"

These terms belong in separate doctrine documentation. They have no function in implementation files.

Plain implementation language is required in code. Examples of correct usage:

| Concept being expressed | Correct comment | Incorrect comment |
|------------------------|-----------------|-------------------|
| Argument band boundary | `// Hard boundary — no transition. Do not add gradient or fade.` | `// Environmental rupture — scroll psychology break point` |
| Friction item spacing | `// Tight spacing intentional. Do not increase.` | `// Compounding recognition depends on density` |
| Snapshot independence | `// Do not import from sibling snapshot files.` | `// Recognition corridor requires independent artifacts` |
| Hero alignment | `// Left-aligned. Do not center.` | `// Perceptual architecture requires asymmetric weight` |

---

## Section 10 — Output Requirements

Every PR must meet these requirements before review.

**File paths listed before code:**
List every file created or modified at the top of your PR description. One path per line. No descriptions, just paths.

**No hidden architectural decisions:**
If you made a decision not explicitly covered by this contract, name it in your PR description under "Decisions made." If you made zero unspecified decisions, state that explicitly.

**Comments enforce constraints, not explain concepts:**
Code comments exist only to prevent a future contributor from removing or changing something. A comment that explains why a design choice was made belongs in a governance document, not in a component file. A comment that says "do not remove this" or "do not normalize this spacing" is a constraint. Use constraint comments. Do not use explanation comments.

**No conceptual doctrine terms in comments:**
Per Section 9. Plain implementation language only.

**PR summary states what was implemented and what was intentionally not implemented:**
Every PR includes two lists:
- **Implemented:** What was built.
- **Intentionally not implemented:** What was stubbed, left as placeholder, or deferred. Include the reason for each deferral in one sentence.

---

## Section 11 — Commit Vocabulary

Commit messages containing the following words will trigger the governance scanner. A flagged commit requires a reviewer to verify before merge. This is not a block — it is a verification gate.

Flagged words: `normalized` `standardized` `unified` `harmonized` `consolidated` `reusable` `simplified` `consistent` `consistency` `cleanup`

These words describe standard engineering maturity. In this repository, they frequently describe the removal of intentional decisions. A commit message that uses them is not automatically wrong — but it requires a human to confirm the change does not remove something that was authored.

If your commit would be accurately described by one of these words, it is likely wrong for Phase 1.

---

## Section 12 — Phase 1 Completion Criteria

Phase 1 is complete when all of the following are true. Not before.

- [ ] Repository structure matches the approved directory layout
- [ ] All routes defined and returning empty shells
- [ ] All seven section shells exist with correct identifiers
- [ ] Typography primitives exist at the correct path and are not yet applied to sections
- [ ] `SectionWrapper` exists with per-section token API, no uniform default
- [ ] Color tokens defined in `tailwind.config.ts`, no layout tokens present
- [ ] Argument band shell exists with hard background, no content, no transition
- [ ] Snapshot stubs SN-01 through SN-07 exist as empty individual files
- [ ] Mobile stub files exist for SN-02, SN-05, SN-06 as separate empty files
- [ ] `AnnotationLabel` primitive exists with `position`, `text`, `weight` API only
- [ ] ESLint rule enforcing snapshot import isolation is active and tested
- [ ] Commit scanner is operational and flags vocabulary correctly
- [ ] CODEOWNERS protects snapshot, section, and layout directories
- [ ] PR template includes governance justification field
- [ ] `geometry-math.ts` exists with value-level utilities only
- [ ] No shared snapshot renderer exists
- [ ] No generic Card component exists
- [ ] No copy has been written into any component
- [ ] All placeholder comments follow the `// [IMPLEMENTATION HOLD — {description}]` format
- [ ] All holds are listed in the Phase 1 completion PR description

A PR that checks all items above and contains no items from Section 3 (Forbidden Work) is a complete Phase 1 delivery.

---

## Governance reference index

Read these before beginning any work in their corresponding area.

| Area | Governance file |
|------|----------------|
| All snapshot work | `implementation-governance/05-snapshot-authoring-protocol.md` |
| Proof section (Phase 4) | `docs/governance/05-proof-section-governance.md` |
| Approved abstractions (full spec) | `implementation-governance/02-approved-abstractions.md` |
| Forbidden refactors (complete list) | `implementation-governance/01-forbidden-refactors.md` |
| Normalization warning patterns | `implementation-governance/03-normalization-danger-signs.md` |
| Per-section build rules | `implementation-governance/04-section-specific-warnings.md` |
| Pre-merge review checklist | `implementation-governance/06-review-checklist.md` |
| Stop-and-ask procedures | `implementation-governance/07-when-to-stop-and-ask.md` |
| Load-bearing inconsistency (what must not be normalized) | `implementation-governance/acceptable-inconsistency.md` |
| Why standard words mean the wrong thing here | `implementation-governance/inverted-vocabulary.md` |

---

*Implementation Execution Contract v1.0 — IntraWeb Technologies*
*Status: Governing. Phase 1 build may begin when this document has been read completely.*
*Next review: At Phase 1 completion gate, before Phase 4 (Proof section) begins.*
