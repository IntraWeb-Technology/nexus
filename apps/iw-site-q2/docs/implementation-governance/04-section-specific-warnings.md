# 04 — Section-specific warnings

**Onboarding tier:** 30-minute operational understanding
**Severity:** Mixed — each section names its own CRITICAL and STRUCTURAL rules
**Audience:** Anyone implementing or modifying a section component.

---

## How to use this document

Before opening a PR that touches a section file, find the section in
this document and read its entry. The entries are not redundant with
the doctrine — they describe the specific build-time decisions that
have produced doctrine violations in similar projects, and how to
avoid them here.

The section list follows the page order:
Hero → Friction → Argument → Pillars → Proof → Model → Continuity → Filter → CTA.

Sections marked **(high-risk)** have specific failure modes that have
required remediation in similar projects. Sections marked **(governed
elsewhere)** are subject to a more detailed governance document.

---

## Hero (high-risk)

**Doctrine:** `/docs/doctrine/01-positioning-foundation.md`,
`/docs/doctrine/03-environmental-doctrine.md`

**Primary risk:** centering and balance.

The Hero is asymmetric. Per environmental doctrine, the page uses a
dominant left-rail structure. Centered hero layouts read as marketing
presentation; left-weighted asymmetry reads as information-structured.

**Forbidden patterns:**

- Centered headline blocks (`text-align: center`, `mx-auto` on the
  primary content container)
- Bilateral symmetry — equal left and right content blocks
- Hero imagery, illustration, or photography (per environmental
  doctrine, no imagery on the homepage at all)
- Animated entrance effects on the headline or supporting text
- A pulsing, looping, or otherwise active element drawing attention

**Required properties:**

- Asymmetric weight, biased toward the left rail
- Three-second scan legibility — a visitor reading only the headline
  carries away the company's positioning
- Type hierarchy that survives at scan speed; subtle hierarchy fails

**Build-time test:**

Open the page on a fresh browser, scroll to the hero, count to three,
look away. What did you carry with you? If the answer is "an animation"
or "a beautiful layout," the hero is wrong. If the answer is the
positioning sentence or the operational territory, the hero is right.

**Rule references:** [C-05]

---

## Friction (high-risk)

**Doctrine:** `/docs/doctrine/01-positioning-foundation.md`,
`/docs/doctrine/03-environmental-doctrine.md`,
`/docs/doctrine/04-scroll-psychology.md`

**Primary risk:** balancing the list.

The Friction section is a list of operational conditions the buyer
recognizes. The list items have intentionally irregular line lengths.
Each item is the natural length of the operational pattern it names.

**Forbidden patterns:**

- Trimming or padding list item content to produce visual balance
- Aligning the right edges of list items to a common boundary
- A two-column layout that pairs items by length
- Bullet characters or icons added to the front of items for visual
  uniformity (the items are sentences, not bullet points)
- Section padding that visually equalizes the section's footprint to
  neighboring sections

**Required properties:**

- Increasing density compared to the Hero — the list accumulates weight
- Tight spacing between items — list items sit close, signaling pressure
- The fifteen-second scan reads as escalating recognition, not as
  bullet points to be checked off

**Build-time test:**

Read the section once at scan speed. Does each item feel like a
distinct pattern, or do they blur into a list? If they blur, the
items are too uniform. If they feel like distinct patterns, the
section is correct.

**Rule references:** [C-05]

---

## Argument (highest-risk)

**Doctrine:** `/docs/doctrine/01-positioning-foundation.md`,
`/docs/doctrine/03-environmental-doctrine.md`,
`/docs/doctrine/04-scroll-psychology.md`

**Primary risk:** the dark band failing to read as a structural rupture.

The Argument section is the only environmental rupture in the page.
Per environmental doctrine, it must feel like a different room, not a
different section. The boundaries are abrupt.

**Forbidden patterns:**

- Gradient backgrounds that fade from the prior section into the band
- Color transitions on scroll that ease the band in or out
- Decorative borders, dividers, or shadows softening the boundary
- Padding values on the band's outer edges that treat it as a section
  with breathing room from neighbors
- A second dark-band section anywhere on the page (the rupture is
  singular)
- Reusing the band's treatment for accent purposes elsewhere
- Smooth animated transitions on entry or exit

**Required properties:**

- Sharp boundary at top and bottom — the band starts and ends abruptly
- Single structural idea delivered at maximum weight
- Cognitive stabilization, not more pressure — the band reorients,
  it does not escalate
- Return to base environment cleanly after the band ends

**Implementation:**

The `SectionWrapper` accepts `rupture="argument-band"` for this section
only. The literal value is intentional — see A3 in `02-approved-abstractions.md`.

**Build-time test:**

Scroll into the band slowly. Does the visitor's cognitive state shift,
or does the section read as a continuation with a different background
color? A continuation is the failure mode. A shift is the target.

**Rule references:** [C-08], F-09

---

## Pillars

**Doctrine:** `/docs/doctrine/03-environmental-doctrine.md`

**Primary risk:** parallelism collapsing into a card grid.

The Pillars section presents three parallel operational conditions.
Parallelism is intentional — the three conditions are structurally
similar at the same level of abstraction. The risk is that the
parallelism gets implemented as visually identical cards in a grid,
which converts operational structure into a feature comparison layout.

**Forbidden patterns:**

- A `<Card>` component reused across the three pillars
- Identical backgrounds, borders, or padding boxes around each pillar
- Icons used as decorative pillar identifiers
- A grid that aligns content within each pillar to a common baseline
  unrelated to the operational content

**Required properties:**

- Three parallel structural treatments — the parallelism is at the
  level of what each pillar describes, not what each pillar looks like
- Per-pillar visual variation appropriate to the content
- Moderate density consistent with the doctrine's density calibration

**Build-time test:**

Cover the text on each pillar. Are the three pillars distinguishable
by visual treatment alone? If yes, the visual treatment has substituted
for content. If no — and only the content distinguishes them — the
section is correct.

**Rule references:** [C-05]

---

## Proof (governed elsewhere, highest-risk)

**Governance:** `/docs/governance/05-proof-section-governance.md`
**Doctrine:** `/docs/doctrine/02-snapshot-doctrine.md`,
`/docs/doctrine/03-environmental-doctrine.md`

**Primary risk:** snapshot abstraction.

The Proof section contains the operational snapshots SN-01 through SN-07.
Every CRITICAL rule about snapshots applies in this section directly.
This document does not duplicate that governance — read the dedicated
proof governance file before working in this section.

**Build-time gate:**

A PR touching the Proof section must reference the proof governance
document in the PR description and indicate which of its rules the
change is aware of.

**Rule references:** [C-01], [C-02], [C-03], [C-04], [C-05], [C-06]

---

## Model

**Doctrine:** `/docs/doctrine/01-positioning-foundation.md`,
`/docs/doctrine/03-environmental-doctrine.md`

**Primary risk:** drift toward services list.

The Model section presents a structured sequence — what changes when
the operational infrastructure is in place. The risk is that the
section reads as a feature list, capabilities catalog, or services
menu, all of which are anti-positioning per the foundation doctrine.

**Forbidden patterns:**

- Service descriptions with prices, durations, or scope language
- A "what we do" enumeration with parallel bullet items
- Icons paired with capabilities
- Comparison tables showing tiers, packages, or levels
- CTA links inside the section pulling visitors out before the next
  section is reached

**Required properties:**

- Reducing density compared to the Proof section — structured sequence,
  more space (per environmental doctrine density calibration)
- Plain-language operational realism, not framework language
- A sequence the visitor can follow at full read speed

**Build-time test:**

Read the section as a paragraph aloud. Does it sound like operational
description, or does it sound like a sales document? If sales, revise
toward observation. The doctrine register is observational.

**Rule references:** [C-05]

---

## Continuity

**Doctrine:** `/docs/doctrine/01-positioning-foundation.md`,
`/docs/doctrine/03-environmental-doctrine.md`

**Primary risk:** drift toward retainer pitch.

Continuity describes that the operational infrastructure runs continuously
after delivery. The risk is that this becomes a pricing pitch for monthly
retainers, which converts operational positioning into agency positioning.

**Forbidden patterns:**

- Pricing displayed for ongoing engagement
- Tier comparisons (Basic, Standard, Premium)
- "Subscribe" or "ongoing partnership" language
- Testimonials about the retainer relationship
- Any element that treats continuity as a product offering

**Required properties:**

- Low density per environmental doctrine
- Plain language describing what continuous operation means in practice
- Operational realism, not commercial positioning

**Rule references:** [C-05]

---

## Filter (high-risk)

**Doctrine:** `/docs/doctrine/01-positioning-foundation.md`,
`/docs/doctrine/03-environmental-doctrine.md`

**Primary risk:** equalizing the columns.

The Filter section has two columns: For and Not For. The Not For
column is heavier — both in content weight and in visual treatment.
This produces the specific perceptual effect of self-disqualification
carrying more operational weight than self-qualification, which is
the correct buyer psychology for this positioning.

**Forbidden patterns:**

- CSS grid that gives the columns equal width
- Trimming Not For content to match For content length
- Padding adjustments that visually balance the columns
- A shared `<FilterColumn>` component with content variance only
- Header treatments equal in weight on both columns
- Neutral color treatment that softens the asymmetry

**Required properties:**

- Visible asymmetry between the columns at scan speed
- Not For column carries more content and more visual weight
- The two columns build as separate artifacts, not as instances of
  one component

**Build-time test:**

A visitor scanning the section at fifteen-second speed should register
that disqualification is the louder signal. If For and Not For feel
balanced, the section is wrong.

**Rule references:** [C-07], F-10

---

## CTA

**Doctrine:** `/docs/doctrine/01-positioning-foundation.md`,
`/docs/doctrine/03-environmental-doctrine.md`

**Primary risk:** drift toward generic contact form.

The CTA is procedural, not pressured. Per the foundation doctrine,
the CTA exists at the end of the recognition sequence — the visitor
who arrives at the CTA has already located themselves in the
operational territory. The CTA's job is to convert that recognition
into a procedural next step, not to create urgency.

**Forbidden patterns:**

- Urgency language ("limited spots," "book now," "don't miss")
- Generic contact form prompts ("Get in touch," "Have questions?")
- Multiple competing CTAs in the same section
- Marketing copy describing what will happen on the form's next page
- Lead capture fields beyond the minimum required to begin the
  qualification conversation

**Required properties:**

- Lowest density on the page, per environmental doctrine
- Single action, maximum space
- Procedural confidence — the visitor knows exactly what happens next
- The CTA copy reads as the operational entry point, not as a
  conversion mechanism

**Rule references:** [C-05]

---

## Cross-section warnings

These rules apply across all sections, not within one.

### Spacing tokens declared per section

Each section's `SectionWrapper` declares its own named spacing token
(`spacing="hero"`, `spacing="friction"`, etc.). A shared spacing token
across multiple sections is the signature of unified rhythm and is
forbidden by [C-05] and D-07.

### Typography weight variance

Per `06-acceptable-inconsistency.md`, weight variance across sections is
intentional. The Argument band uses weight differently than the Friction
list. Standardizing weight across sections collapses the rupture mechanic.

### No motion that calls attention to itself

Per `03-environmental-doctrine.md`, motion is near-zero. If a section
includes any motion, it is reviewed against [S-07] before merge.

### No imagery anywhere

Per environmental doctrine, no photography, illustration, or stock
imagery exists on the homepage. If a section requires "imagery," the
requirement is wrong, not the doctrine.

---

## Mobile considerations per section

Per `01-forbidden-refactors.md` F-15, three snapshots in the Proof
section require separately authored mobile artifacts. Those mobile
artifacts are governed by `05-snapshot-authoring-protocol.md`.

Other sections may use Tailwind responsive prefixing for mobile layout,
provided the result preserves the section's authored properties. A
mobile layout that converts the asymmetric Hero into a centered stack
is forbidden — it normalizes the load-bearing asymmetry. A mobile
layout that preserves the asymmetry within the narrower viewport is
correct.

The mobile review checkpoint is: does the mobile version feel like the
same section in a smaller viewport, or does it feel like a different
(more conventional) section that happens to share copy?

The first is correct. The second is normalization that has used the
viewport size as cover.

---

## Phase 1 scope

Per the milestone model in `00-read-this-first.md`, Phase 1 covers:

- Hero
- Friction
- Argument

Phase 1 must achieve tension architecture survivability before the
remaining sections are built. The other sections in this document are
documented for completeness but are not in scope for the current
implementation phase.

Phase 4 covers the Proof section. The remaining phases are not yet
defined and will be assigned at the appropriate phase boundaries.

---

## Verification

Section-specific verification is part of the pre-merge checklist in
`06-review-checklist.md`. The checklist includes per-section items
that map to the rules above.

Mechanical layer:
- ESLint enforces snapshot independence within Proof
- CODEOWNERS protects each section's directory
- The PR template requires section identification when sections change

Manual review:
- Each section's primary risk above must be checked against the diff
- Build-time tests in this document are run by the reviewer, not by CI

---

## Survivability risks

The risks below are the failure modes most likely to compromise this
document's effectiveness over time:

- **Section convergence** — sections gradually adopting each other's
  treatments via small, individually-defensible commits. Surfaces only
  at whole-page review (D-13).
- **Phase boundary drift** — work intended for later phases leaking
  into Phase 1 because "we're already touching the file." Each phase
  boundary exists to force a doctrine review checkpoint.
- **Mobile-as-afterthought** — sections built desktop-first with mobile
  treated as responsive scaling, even where the section permits that.
  The doctrine still requires the mobile result to preserve authored
  properties; "permitted" is not "unconsidered."
- **Build-time tests skipped under deadline pressure** — the per-section
  tests in this document are heuristic and uncached. The pressure to
  skip them is highest in the final commits before a phase gate.

---

## Assumptions and unresolved dependencies

- The section list and order are as listed in `03-environmental-doctrine.md`
  density calibration. If a section is added, removed, or reordered,
  this document and `02-approved-abstractions.md` (the `SectionId` enum)
  must update together.
- The proof governance document path is `/docs/governance/05-proof-section-governance.md`
  per `QUICK-REFERENCE.md`. If it relocates, references update.
- Phase boundaries (Phase 1, Phase 4) are defined in
  `00-read-this-first.md`. Other phases are not yet assigned content
  and are not in scope for this document.
