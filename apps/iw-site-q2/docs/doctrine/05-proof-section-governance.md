# 05 — Proof Section Governance
**IntraWeb Technologies — Production Governance: Proof Section**
**Version:** 1.0
**Status:** Governing — applies to all production work on the Proof section

---

## Scope

This document governs production of the Proof section. It defines what is allowed, what is forbidden, and how to evaluate whether the section is drifting from its intended register.

This document does not explain why these rules exist. For the reasoning behind these constraints, see `02-snapshot-doctrine.md` and `03-environmental-doctrine.md`.

This document is written for use by frontend designers and implementation agents. Every rule is observable, reviewable, and enforceable without reference to doctrine philosophy.

---

## Section Identity

**Section name:** Proof
**Position in page:** Post-Pillars, pre-Model
**Primary job:** Shift register from recognition to consequence
**Secondary job:** Sustain operational evidence register — do not drift into case study, SaaS proof block, or social proof format
**Governing test:** Does the visitor feel consequence pressure, or does the section feel like a features grid?

---

## Section Structure

Each proof artifact contains three layers in order:

1. **Consequence line** — scan anchor, typographically dominant, carries the operational outcome
2. **Diagnostic snapshot** — the operational condition visualized
3. **Annotation layer** — consequence labels, present tense, operationally specific

The register transition line appears once, above the first artifact, at full section width:

> *"Pattern recognition without implementation consequence is analysis. Here is what changed."*

This line is load-bearing. It is not a headline, subhead, section label, or decorative element. It requires its own typographic treatment. See Typography Rules for specification.

---

## Hard Constraints

These cannot be violated under any circumstance. No exceptions. No overrides.

**HC-01** No card borders on any artifact container. No border, no border-radius used as a container boundary, no box-shadow creating card separation. Zero.

**HC-02** No background color variation used to separate artifacts. Separation is achieved through space only. No background color shift between artifacts, however subtle.

**HC-03** No metric callouts. No percentages, no time savings numbers, no efficiency figures presented as proof. Consequence lines name structural changes, not measurements.

**HC-04** No artifact header labels in category or icon-plus-label format. No category badge above an artifact. No colored dot plus label. No category tag of any kind.

**HC-05** No consistent height normalization across artifacts. Artifacts are different sizes because operational conditions have different complexity. Any layout mechanism that forces equal heights is forbidden.

**HC-06** All annotation labels present tense only. "Ownership changes twice before follow-up" not "ownership changed." "Report depends on one person" not "report depended on one person." Any past tense annotation label fails QA.

**HC-07** Maximum seven nodes per diagram. Hard limit. If a condition requires more than seven nodes to be legible, the condition scope is too broad and must be narrowed before build begins.

**HC-08** No symmetrical node distribution in any diagram. If nodes distribute evenly across the diagram space, the diagram fails. Asymmetry must be visible and motivated by the operational condition being shown.

**HC-09** The register transition line must not be styled as a section headline, a divider label, a pull quote, or a subhead. If it shares a typographic treatment with any standard component in the design system, it is wrong.

**HC-10** No animation on diagram elements during page idle state. Diagrams are static. Scroll-entry reveal is permitted under the conditions defined in SC-03 only. Nothing loops, pulses, or animates continuously.

---

## Soft Constraints

Strong defaults. Require explicit documented justification to override.

**SC-01** Artifact spacing should vary by consequence weight. Heavier consequence artifacts get more vertical breathing room. Consistent mathematical spacing across all artifacts is a drift signal. Default: minimum 25% variation between the smallest and largest artifact gap.

**SC-02** Consequence lines run at approximately 1.4–1.6x the type scale of annotation labels. This is a minimum contrast threshold, not a fixed ratio. If the hierarchy between consequence line and annotation is not immediately parseable at arm's length from the screen, the contrast is insufficient.

**SC-03** Scroll-entry diagram reveal is permitted only if it reads as a system state becoming visible, not as an entrance animation. Test: if a motion designer would describe the reveal as "elegant" or "satisfying," it fails. If a developer would describe it as "just appearing," it passes.

**SC-04** Artifact sequence runs three to five artifacts. Fewer than three underpowers consequence escalation. More than five risks section fatigue. Default: four artifacts.

**SC-05** Diagram stroke weights should vary by path significance. Active paths, stalled paths, broken paths, and dead-end paths carry distinct stroke weights. Consistent stroke weight across all paths in a diagram is a drift signal.

**SC-06** Mobile viewport diagrams compress to primary visual tension pattern plus single consequence annotation. All secondary annotation labels are hidden at mobile breakpoint. The compression target is defined per artifact before build, not handled by global responsive scaling.

---

## Protected Elements

These elements have fixed behavior. They cannot be restyled, repositioned, or replaced without explicit written authorization.

**PE-01 — Register transition line**
Appears once. Above first artifact. Full section width. Typographic treatment distinct from all other text elements on the page. Cannot be moved inside an artifact. Cannot be removed for visual cleanliness.

**PE-02 — Consequence line per artifact**
One per artifact. Typographically dominant within its artifact. Must be the first element the eye lands on within the artifact at scan speed. Cannot be subordinated to the diagram visually. Cannot be replaced by a metric.

**PE-03 — Operational asymmetry within each diagram**
The specific irregularity defined for each artifact in the per-artifact compression hierarchy document. Cannot be normalized during responsive scaling. Cannot be corrected during QA for visual consistency. It is not an error.

**PE-04 — Annotation tense**
Present tense throughout. Cannot be changed for editorial variety. Cannot be changed to past tense for a more authoritative register. Tense is a doctrine requirement.

---

## Forbidden Normalization Behaviors

These are specific production moves that will be attempted under normal design and development pressure. Each is forbidden and each has a detection method.

---

**FN-01 — Adding card containers for visual clarity**
Why it will happen: multiple items in sequence look uncontained without borders.
Why it is forbidden: containerization converts evidence into features.
Detection: any CSS property creating a visible or implied boundary around an artifact container — border, border-radius used as a boundary, box-shadow, background-color change.

**FN-02 — Equalizing artifact heights for grid alignment**
Why it will happen: unequal heights create layout tension that feels unresolved.
Why it is forbidden: height normalization removes the visual signal that operational conditions have different complexity.
Detection: min-height or fixed height value applied to artifact wrappers.

**FN-03 — Applying consistent node sizing across diagrams**
Why it will happen: component-based SVG systems use standardized node components.
Why it is forbidden: consistent node sizing removes the overload signal from hub nodes and the fragility signal from isolated nodes.
Detection: all nodes sharing identical dimensions across diagrams.

**FN-04 — Adding category labels for scannability**
Why it will happen: multiple artifacts without labels feel hard to navigate quickly.
Why it is forbidden: category labels convert operational evidence into a taxonomy, shifting register toward SaaS feature comparison.
Detection: any text element above or within an artifact that names a category rather than a consequence.

**FN-05 — Smoothing path geometry for visual polish**
Why it will happen: irregular path curves feel unrefined.
Why it is forbidden: path irregularity carries operational meaning. Stalled, broken, and dead-end paths should not look resolved.
Detection: all paths using identical curve smoothing values; all path terminals having identical treatment.

**FN-06 — Normalizing spacing to a consistent grid unit**
Why it will happen: design systems enforce spacing scales.
Why it is forbidden: consistent spacing makes the section feel like a designed grid rather than weighted evidence.
Detection: all artifact vertical margins sharing identical pixel values.

**FN-07 — Converting annotation labels to past tense**
Why it will happen: past tense reads as more authoritative in case study and testimonial contexts.
Why it is forbidden: past tense shifts register from current operational condition to historical event.
Detection: any annotation label containing a past tense verb.

---

## Typography Rules

**TR-01** Three type levels active within the section: consequence line, annotation label, register transition line. No fourth level introduced without authorization.

**TR-02** Consequence line: DM Sans, weight 500–600. Must pass arm's-length isolation test — readable as a standalone statement from arm's length from screen.

**TR-03** Annotation labels: DM Sans, weight 400. Noticeably smaller than consequence line. Hierarchy must be stark, not subtle.

**TR-04** Diagram node labels: JetBrains Mono. Non-negotiable. Monospace treatment signals operational data, not marketing copy. Sans-serif node labels fail without exception.

**TR-05** Register transition line: DM Sans, weight 400 or 300. Distinguished from body copy by scale reduction, italics, or both. Must not share typographic treatment with any other element in the section. Must read as a structural marker, not a headline.

**TR-06** No bold treatment on annotation labels. Bold within annotations implies hierarchy across labels. All annotation labels carry equal evidential weight.

---

## Spacing Rules

**SR-01** Minimum vertical space between artifacts: 80px at desktop viewport. This is a floor, not a target.

**SR-02** At least one artifact gap must be 25% larger than the smallest artifact gap. Identical spacing across all artifacts fails.

**SR-03** Consequence line top margin within each artifact must visually separate it from the artifact above. On fast scroll, it must read as belonging to its own artifact, not the previous one.

**SR-04** Annotation labels within a diagram: spacing between labels reflects operational proximity. Labels describing the same failure condition cluster closer together. Labels describing distinct failure points have more separation between them. Grid-spaced annotation labels fail.

**SR-05** Section top margin from Pillars must be larger than any internal artifact spacing. The section must register as an environmental shift, not a continuation.

**SR-06** No horizontal centering of artifact content. Left-aligned throughout. Centered diagrams fail.

---

## Diagram Construction Rules

**DC-01** Each diagram constructed individually. No shared component template that normalizes geometry across diagrams. Shared SVG utilities are permitted. Shared layout templates that impose consistent geometry are forbidden.

**DC-02** Node sizing reflects operational load. Nodes carrying more connections or representing bottleneck conditions are visually larger or heavier than peripheral nodes. Uniform node sizing across a diagram fails.

**DC-03** Path states are visually distinct. Active path, stalled path, broken path, and dead-end path each carry distinct visual treatment — stroke weight, opacity, terminal treatment, or curve behavior. Identical path styling for all states fails.

**DC-04** Each diagram has a defined primary visual tension pattern documented before build. Acceptable patterns: bottleneck, overloaded hub, broken sequence, parallel isolation, forced convergence, stalled queue, routing ambiguity. If the diagram's tension pattern cannot be named in one of these terms, the diagram scope is not defined and is not ready for build.

**DC-05** Diagram bounding area is not fixed-height. The diagram occupies the space its operational condition requires. Fixed-height containers normalize diagram complexity.

**DC-06** Per-artifact mobile compression target documented before build. For each artifact: name the one visual element that must survive compression, and the one annotation label that must survive. Everything else is expendable at mobile viewport. This is a build prerequisite, not a post-build decision.

---

## Annotation Rules

**AR-01** Every annotation label names an operational consequence or condition. No label names an infrastructure category, a system component name, or a framework concept. If a label could appear in a technical architecture document without modification, it fails.

**AR-02** Labels sound like something a person said or observed in an operational context. If a label sounds like something a consultant wrote in a deliverable, it fails.

**AR-03** Annotation labels are fragments, not full sentences. They name conditions, not explain them. Full sentences in annotation position drift toward case study register.

**AR-04** Each artifact has exactly one consequence line. Not two. Not zero. One dominant consequence statement naming what structurally changed or what is structurally absent.

**AR-05** Consequence lines name structural changes in operational terms.
- Correct: "onboarding runs without Sarah in the loop"
- Failing toward abstraction: "single point of failure eliminated"
- Failing toward metrics: "onboarding time reduced 60%"

**AR-06** Maximum annotation label count per diagram: eight. Beyond eight, either the diagram scope is too broad or annotation discipline has broken down. Reduce diagram scope or reduce label count before build.

---

## QA Review Checks

Run in sequence before section sign-off. Each check has a pass/fail result.

**QA-01 — Arm's-length test**
Step back from the screen until body text is barely readable. Are consequence lines still the dominant visual element in each artifact? If annotation labels compete with consequence lines at this distance — FAIL. Typography hierarchy must be revised.

**QA-02 — Card detection test**
Look at the section with all content removed mentally. Does the layout structure imply containers? If yes — FAIL. Containerization has entered through spacing treatment or background values.

**QA-03 — Tense audit**
Read every annotation label aloud. Any past tense verb — FAIL. Flag and rewrite before sign-off.

**QA-04 — Symmetry test**
For each diagram: is there a visible direction to the asymmetry? Can you identify which operational condition causes the irregularity? If the irregularity looks accidental rather than motivated — FAIL. Diagram needs revision.

**QA-05 — Category label scan**
Look at every text element above, below, or adjacent to a diagram. Does any of them name a category rather than a consequence? If yes — FAIL. FN-04 has occurred.

**QA-06 — Mobile compression test**
Render each artifact at 375px viewport. Does the primary visual tension pattern survive? Does the single protected consequence annotation survive? If a diagram looks broken rather than compressed — FAIL. Per-artifact compression target was not followed.

**QA-07 — Register test**
Read the consequence line of each artifact aloud. Does it sound like something an operations manager would say in a post-mortem? Or does it sound like a line from a sales deck? Post-mortem register — PASS. Sales deck register — FAIL.

**QA-08 — Spacing variation check**
Measure vertical spacing between all artifacts. Are all gaps identical? If yes — FAIL. SR-02 requires motivated variation.

---

## Drift Indicators

Early warning signals that normalization is occurring. These do not automatically fail the section but require immediate review.

**DI-01** All artifacts appear the same size.
Indicates height normalization. Check for fixed-height containers.

**DI-02** The section feels like it has a grid or columns.
Indicates grid alignment has been applied. Proof section is not a grid.

**DI-03** Diagrams look like they came from the same template.
Indicates shared component normalization. Each diagram should have visibly distinct geometry.

**DI-04** The section feels "clean."
Most important drift indicator. If a designer describes the Proof section as clean, polished, or refined — the anti-resolution pass has not been applied. Cleanliness is a warning signal in this section.

**DI-05** A visitor would describe what they're looking at as "graphics" or "icons."
Indicates diagrams have drifted toward decoration. Diagrams must read as operational artifacts.

**DI-06** The consequence lines feel interchangeable.
Indicates annotation discipline has drifted toward consistent formatting at the expense of operational specificity. Each consequence line must belong to its specific condition only.

---

## Production Rejection Conditions

If any of the following are present at review, the section is returned for revision before approval. No exceptions.

**PR-01** Any card border or card container treatment present
**PR-02** Any past tense annotation label present
**PR-03** Any metric callout presented as consequence
**PR-04** Any category label present above or within an artifact
**PR-05** Node sizing consistent across all diagrams
**PR-06** All artifact spacing identical
**PR-07** Any diagram with symmetrical node distribution
**PR-08** Register transition line styled as headline or subhead
**PR-09** Any annotation label using infrastructure category language
**PR-10** Mobile render where primary visual tension pattern is not recoverable at 375px

---

## Implementation Note

This document is executable without reference to doctrine philosophy. A frontend designer or implementation agent can build against these rules, run the QA checks, and identify drift without understanding the strategic reasoning behind them.

The rules are derived from doctrine. They do not require doctrine to be enforced.

Any question of "why does this rule exist" is answered in `02-snapshot-doctrine.md` and `03-environmental-doctrine.md`. Questions during build about what is allowed are answered here.
