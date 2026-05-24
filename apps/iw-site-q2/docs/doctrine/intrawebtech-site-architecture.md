# IntraWeb Technologies — Site Execution Architecture
**Phase:** Structural execution planning. Pre-copywriting. Pre-implementation.**  
**Version:** 2.0 — May 2026  
**Authority:** Supersedes blueprint Section 1 sequencing with full implementation-grade spec.

---

## How to Use This Document

This document is the handoff-ready spec for Cursor implementation. Each section defines exact structure, purpose, visitor cognitive state, and constraints. No copy is written. No aesthetic decisions are made here. Every section answers: what does the visitor need to understand here, and how is the structure engineered to deliver that?

---

## Part 1: Homepage Wireframe Architecture

### Governing Principle

The homepage must create a single progressive experience: friction recognition → proof of removal → trust in the operator → confidence to act. Each scroll threshold advances one of these states. No section creates cognitive load without immediately resolving it.

---

### Section 1 — Above the Fold (Hero)

**Purpose:** Deliver immediate practical orientation. The visitor must understand what disappears from their operation before they understand anything about the company.

**Visitor enters knowing:** nothing  
**Visitor exits knowing:** what problem this company solves and for whom

**Content architecture:**
- Label line (small, above headline): 2-4 words identifying the category of work. "Operational systems" or "Workflow infrastructure" — not a tagline
- Primary headline: one sentence. Names the operational burden removed. Subject is the visitor's operation, not the company. No abstract nouns as the first word.
- Secondary line: one sentence. Names the mechanism (systems, automation, infrastructure). This is where the worldview language earns its place — after the consequence has landed.
- CTA pair: primary action (Book a Systems Call) + secondary action (See What Changed). The secondary CTA is proof-directed — it sends trust-seekers to the evidence before asking for conversion.

**What is forbidden above the fold:**
- Company philosophy as the primary statement
- Any sentence beginning with "We build"
- Abstract nouns: "operational infrastructure," "systems thinking," "alignment"
- More than two sentences of body text
- Any mention of AI, automation, or technology in the first visible viewport

**Scan behavior:** Visitor eye path is: label → headline → secondary → CTA pair. Four stops. No paragraph blocks. No decorative subheads.

**Visual pacing:** Hero image is supporting, not dominant. The text carries the weight. Image reinforces operational reality (not tech abstraction).

**Cognitive load:** Minimal. One decision point: do I recognize this problem? If yes, they scroll. If the secondary CTA is visible, they may click proof first — that is acceptable and should be designed for.

---

### Section 2 — Friction Recognition Grid

**Purpose:** Confirm the visitor is in the right place. Create tension by naming the pain with consequence. Set up proof by making the problem feel real and costly.

**Visitor enters knowing:** this company removes operational burden  
**Visitor exits knowing:** my specific friction is named here, and it has a cost

**Content architecture:**
- Section label: brief, direct. "What we see every day" or "The patterns" — not "Our expertise" or "Common challenges"
- Grid layout: 3x3 static grid (not animated ticker). Nine pain points.
- Each cell: two lines maximum. Line 1: the pain label (existing copy is correct — do not genericize). Line 2: one consequence sentence. The consequence is the cost of the pain, not a description of it.
- No icons. No decorative elements. The words do the work.

**Consequence sentence model:**  
Pain label + "Every [time period], someone [manual action] to keep it moving."  
Or: Pain label + "The [function] cannot happen until [person/system] is available."  
Not: Pain label + "This slows down your team." (too generic)

**Scan behavior:** Grid scans as a matrix. Visitor pattern-matches across cells. One cell recognition is enough to continue scrolling. Design for recognition, not sequential reading.

**Cognitive load:** Low. Grid format distributes load. Visitor selects what's relevant and ignores what isn't. No section should require reading all nine.

**Relief setup:** The consequence sentences create tension. This tension is not resolved in this section — it carries into the proof section. Do not add resolution language here.

**Transition to next section:** Natural. "Here is what changed" is the implicit bridge. No explicit transition copy needed.

---

### Section 3 — Proof (What Changed)

**Purpose:** Deliver evidence that the friction named above has been removed in real environments. Establish that the outcomes are measured, specific, and earned.

**Visitor enters knowing:** my specific friction is real and costly  
**Visitor exits knowing:** this company has removed exactly this kind of friction for organizations like mine

**Content architecture:**
- Section label: "What changed" — already used in current proof cards. Extend it. Do not rename.
- Three proof cards minimum. Each card carries:
  - Anonymous context line: company type, size, vertical. One sentence. No name required.
  - Process title: what the engagement covered (Request to Fulfillment, Monthly Reporting, Onboarding)
  - "What Was Breaking": 3-4 bullet points. Specific, enumerated. Existing cards are close — add one more specificity layer.
  - Impact stat: large, prominent. The number is the anchor.
  - Relief sentence: one sentence after the stat. Names what operationally changed, not just the metric. "The team stopped manually chasing status and started seeing it in real time."
- "See all records" link below cards — directs to Work/Operational Records page

**What is forbidden:**
- Client quotes or attributed testimonials in this section (they belong on About or a dedicated trust section, if used at all)
- Percentage improvements without an operational description of what changed
- Stats that float without anchoring context

**Scan behavior:** Cards are scanned horizontally, then vertically within the selected card. Impact stat is the anchor — largest visual element. Context line is read first. Bullet breakdown is read second. Relief sentence completes the card.

**Cognitive load:** Medium. Three cards is the right ceiling for this position in the scroll. More creates fatigue. Less underproves.

**Conversion signal:** This is the first section where a high-intent visitor considers booking a call. The CTA is not placed here — but the proof section should end with a micro-signal: "All of this starts with a Diagnostic." One line. No button. The button appears in the CTA section.

---

### Section 4 — Operational Infrastructure Framing (The Model)

**Purpose:** Explain how IntraWeb approaches the work — now that the visitor understands what gets fixed. This is where the worldview earns its position.

**Visitor enters knowing:** this company has fixed these problems before  
**Visitor exits knowing:** I understand how they approach it and why it's different from other options I've considered

**Content architecture:**
- Section label: "How we work" or "The model" — minimal
- Brief framing paragraph: 2-3 sentences maximum. The worldview lands here as reinforcement, not introduction. "Operational infrastructure" language is appropriate now.
- Four-step process: Diagnose → Design → Implement → Optimize
- Each step carries:
  - Step number and name
  - One sentence: what IntraWeb does at this step
  - One sentence: what the visitor receives or stops doing at this step
  - Output label: what physically exists at the end of this step that did not before
- Visitor role note: one line per step — what access or input the client provides at this stage. This begins building operational imagination without a separate section.

**What is forbidden:**
- Generic consulting language ("holistic," "collaborative," "tailored")
- Steps without named outputs
- Any step description that could apply to any other firm

**Scan behavior:** Steps scan vertically. Step numbers create anchor points. Visitor eye path: number → name → output label → description. Design for this order.

**Cognitive load:** Medium. The four-step structure manages load by providing clear chunking. Each step is a unit. No step should contain more than 40 words.

**Differentiation moment:** The "what the visitor receives" line per step is the differentiator. No other firm structures its process description around what the client gets at each stage. This needs to be visible in the layout — not buried in paragraph text.

---

### Section 5 — Who This Is For (Fit)

**Purpose:** Give the visitor the information to self-qualify. Accelerate commitment for the right prospect. Honestly redirect the wrong one.

**Visitor enters knowing:** I understand what this company does and how  
**Visitor exits knowing:** whether they are the right fit

**Content architecture:**
- Section label: "Who we work with" — existing label is fine
- Two-column or stacked layout: "This is a fit" and "This is not a fit"
- Fit indicators: each one carries a consequence clause (not just the filter)
  - "Teams of 20-150 people" is a filter. "Teams where operational complexity has grown faster than the systems that support it" is a reason.
- Not-a-fit indicators: brief, honest, no apology. This section builds trust by demonstrating selectivity.
- Industry tags: Logistics, Manufacturing, Distribution, Services — only if at least one of these is tied to a proof card. If not, remove them or anchor them to the Operational Records page.
- The animated workflow diagram: if retained, add a visible caption identifying what engagement or use case it represents. If the caption cannot be made specific, replace with a static representation that is captioned.

**What is forbidden:**
- Vague fit language ("companies ready to grow")
- Any claim about verticals not supported by proof elsewhere on the site
- Apologetic framing in the not-a-fit section

**Scan behavior:** Two-column layout scans as a comparison. Visitor quickly locates their column. Fit indicators are read sequentially within each column.

**Cognitive load:** Low. Binary structure manages load. Visitor is relieved of ambiguity.

---

### Section 6 — Trust Signal Bar (Operational Credibility)

**Purpose:** One compact trust density moment before the CTA. Provides implementation credibility without a full section.

**Visitor enters knowing:** whether they fit  
**Visitor exits knowing:** that the operational depth is real and specific

**Content architecture:**
- Three to four brief stats or operational facts, displayed horizontally
- Drawn from real operational data: 62 production workflows, 8 operational categories, workflow cycle time reductions, years in production engineering
- One line per stat: number + descriptor. No sentences needed here.
- No icons. Numbers do the work.

**What is forbidden:**
- Generic credibility stats (years in business, clients served) without specificity
- Made-up round numbers
- Any stat not grounded in an operational reality described elsewhere on the site

**Note:** This section can be omitted if the proof cards already carry sufficient credibility weight. It is a density amplifier, not a requirement.

---

### Section 7 — CTA

**Purpose:** Convert accumulated trust and clarity into a first action. The visitor should feel that booking a call is the obvious next step, not a commitment.

**Visitor enters knowing:** this company is the right fit, the approach is credible, the outcomes are documented  
**Visitor exits having:** booked a call or left with intent to return

**Content architecture:**
- Brief positioning line: where the visitor is in their decision — not a pitch
- One outcome promise: what they will understand after the call that they don't understand now
- One honest expectation line: what the call is (working session, not pitch)
- Primary CTA: "Book a Systems Call" or "Start with a Diagnostic" — one button, not two competing CTAs
- Secondary: email or link for visitors not ready to book

**What is forbidden:**
- Three-bullet process reassurances (current format — replace it)
- Generic CTAs: "Let's talk," "Get started," "Learn more"
- Urgency inflation: "Limited spots," "Apply now"

**Cognitive load:** Minimal. The work is done. This section should feel inevitable, not like a close.

---

### Homepage Visual Pacing Summary

| Section | Density | Cognitive Load | Primary Job |
|---------|---------|----------------|-------------|
| Hero | Low | Minimal | Orient |
| Friction Grid | Medium | Low | Recognize |
| Proof Cards | High | Medium | Trust |
| Model | Medium | Medium | Understand |
| Fit | Low | Low | Self-qualify |
| Trust Bar | Low | Minimal | Confirm |
| CTA | Low | Minimal | Act |

**Pacing rule:** No two adjacent high-density sections. Proof Cards (high) is followed by Model (medium) — not another high-density section. The density rhythm is: low → medium → high → medium → low → low → low.

---

## Part 2: Operational Records System Governance

### System Name

"Operational Records" — not Case Studies, not Portfolio, not Work. The name signals: these are documented operational outcomes, not marketing collateral.

### Governing Tone

Forensic and operational. The voice is that of someone describing what they found, what they built, and what changed — not someone narrating a success story. Past tense throughout. No superlatives. No outcome inflation.

### Mandatory Section Structure

Every Operational Record follows this exact seven-section structure. No sections are optional. No sections are added.

**1. Operational Situation** (60-90 words)  
Anonymous context: company type, headcount range, industry vertical, and operational environment at time of engagement. Written as a factual description of the organization, not a complaint or problem statement. This section answers: who were they, and what did their operation look like?

**2. What Was Breaking** (4-6 bullets, ≤15 words each)  
Specific, enumerated breakpoints. Not "inefficiency" — named points where: ownership transferred unexpectedly, data was re-entered manually, a single person held a critical dependency, cycle times extended due to waiting, or errors compounded across handoffs. Each bullet names one specific failure point.

**3. Root Cause** (1-2 sentences, ≤40 words total)  
The infrastructure gap beneath the surface symptoms. This is the diagnostic layer — it shows IntraWeb identified the structural problem, not just the visible friction. This section is what separates a vendor from a diagnostician.

**4. What Changed** (3-5 bullets)  
What was built. Specific systems, connections, logic, and automations. Tools can be named (n8n, HubSpot, Stripe). Each bullet describes one system or connection implemented. Not "we automated the process" — the actual logic: trigger → condition → action → output.

**5. What Was Removed** (4-6 bullets, ≤15 words each)  
The operational relief section. Each bullet names one specific manual step, dependency, or process that no longer exists. This is written from the client's operational reality: "The weekly manual export from [System A] to [System B] no longer happens." Specific and enumerated.

**6. Measured Impact** (1-3 metrics)  
The quantified outcomes. Each metric: the number, what it measures, and the baseline it's measured against. No floating percentages. "Cycle time reduced from 9 days to 48 hours" — not "94% improvement."

**7. Current Operational State** (1-2 sentences)  
What the environment looks like now, on a recurring basis. Written as present-tense operational description: "The reporting cycle runs automatically every Monday. No one assembles it." This section delivers the relief resolution — the emotional close of the record.

### Metadata Structure

Each record carries visible metadata displayed as tags or a compact header:
- Industry: [Logistics / Manufacturing / Distribution / Services / Other]
- Company size: [20-50 / 51-100 / 101-150]
- Engagement type: [Automation / Integration / Platform / Diagnostic Only]
- Primary friction resolved: [Reporting / Onboarding / Lead Intake / Fulfillment / Other]
- Implementation timeline: [2-4 weeks / 1-2 months / 3-6 months]

### What Is Forbidden in Operational Records

- Client names or logos without explicit written permission
- Direct quotes or attributed testimonials (the record itself is the evidence)
- Outcome claims not grounded in a described operational situation
- Superlatives: fastest, best, most, unprecedented
- Any sentence that begins with "IntraWeb helped" — the record describes what changed, not who helped
- Before/after photos or decorative imagery
- Generic outcome language: "transformed," "optimized," "revolutionized"
- Section headings that editorialize: "The Results" or "The Win" are not permitted

### What Creates Trust in an Operational Record

- Specific numbers with specific contexts
- Named tools and systems
- Bullet breakdowns of what specifically was removed
- A root cause diagnosis that names a structural gap, not just a symptom
- An ongoing operational state description that sounds like a real Monday morning

### What Creates Fluff

- Outcome stats without operational context
- Passive language that avoids saying what the system does
- Excessive process description without naming outputs
- Any sentence that could appear unchanged in a competitor's record

### Operational Records Page Architecture

- Page label: "Operational Records"
- Sub-label: one sentence — the governing principle of the system ("Documented operational outcomes from completed engagements")
- Filter bar: metadata tags as filters (industry, engagement type, friction type)
- Record grid: two columns on desktop, single column on mobile
- Record card in grid: context line + friction type + impact stat + link to full record
- Full record page: single column, generous white space, seven sections in order

---

## Part 3: Services Page Restructuring

### Governing Question

How should services be organized? The four options:  
a) Operational problems  
b) Engagement types  
c) Implementation depth  
d) Business maturity

**Recommendation: Engagement types, with operational problem framing at the entry point.**

**Rationale:** IntraWeb's differentiated positioning is about how the work is engaged, not what category of tool is deployed. A visitor who arrives with a "reporting problem" needs to first understand what kind of engagement resolves it — not select from a menu of service categories. Organizing by operational problem first creates the frame, then engagement type delivers the path.

The current page fails because it organizes by deliverable type (websites, automation, SaaS builds, e-commerce) with no bridging logic. The visitor who has a lead intake problem cannot tell which tier or offering applies to them.

### Proposed Services Page Information Hierarchy

**Entry level — Operational Problem Framing**

Three to four operational problem clusters, presented as entry points before any service is named:
- "Manual work that shouldn't require a human"
- "Systems that don't talk to each other"
- "Reporting that depends on someone assembling it"
- "Growth that has exposed your operational limits"

Each cluster links or expands to the engagement path that addresses it. This is not navigation — it is qualification. A visitor selects the problem that applies, which surfaces the relevant engagement type.

**Level 2 — Engagement Types (not service categories)**

Four engagement types, presented in order of operational readiness:
1. Diagnostic — understand the problem before committing to a solution
2. Systems and Automation — remove manual processes and connect existing tools
3. Web and Platform — build the client-facing or internal-facing layer
4. SaaS and Product — build the product itself

Each engagement type gets:
- A one-sentence purpose statement
- A concrete example of what the output looks like
- A scope signal (not full pricing, but scale indicator: "typically 4-8 weeks" or "project-based or retainer")
- A self-qualification test: "This is the right engagement if..." — one or two conditions

**Level 3 — Tiers within engagement types**

Tiers (Standard, Advanced) appear within the engagement type, not as top-level navigation. A visitor who selects "Systems and Automation" then sees Standard vs. Advanced with specific scope differentiators — not just name distinctions.

**What is abolished:**
- "IntraWeb isn't a menu of services. It's a system." as the opening line — replace with a one-line operational context statement
- Website packages as the first service described
- Any tier listed without a concrete scope example
- The e-commerce section as a standalone module (integrate it as examples within the automation section)

**What is preserved:**
- The website package descriptions (Starter, Growth, Advanced) — they are already concrete and scannable
- The Diagnostic as the primary entry-point CTA throughout the page
- The FAQ section — it is strong and should remain

### Cognitive Branching Reduction

The current page creates seven to eight competing decision points before a visitor can identify their path. Target: two decision points before a clear path is established.

Decision point 1: Which operational problem applies to me?  
Decision point 2: What engagement type addresses that problem?

Everything else is detail within a chosen path.

---

## Part 4: Visual Trust System

### Governing Doctrine

Every visual element either adds operational credibility or it does not belong on the page. There is no neutral visual on a trust-critical site. If a visual could appear on any other agency website, it does not help IntraWeb.

### Visuals That Create Trust

- Workflow diagrams that are labeled, captioned, and clearly representing a specific real system
- Before/after data comparisons (cycle time, step count, headcount dependency)
- Document representations: a screenshot of an actual operational deliverable, an actual workflow canvas (anonymized), an actual diagnostic report structure
- System architecture maps that name tools and connections — if they are real, not generic
- Plain data displays: a table of metrics from an engagement, presented without decoration

### Visuals That Create Tech Theater (Avoid)

- Animated connection lines between abstract nodes with no labels
- Dark-mode dashboards with no real data
- Generic stock imagery of people in meetings or looking at laptops
- AI-generated abstract imagery (gradient orbs, neural network patterns, floating geometry)
- Full-bleed hero images that are decorative without operational content
- Workflow diagrams with generic node labels (INPUT → PROCESS → OUTPUT)

### The Animated Workflow Diagram (Current Site)

The INBOX → CRM → PARSE → AGENT → RULES → APPROVE → DATABASE → ALERT → AUDIT LOG diagram on the current homepage is close to trust-building but is currently tech theater because it lacks a caption connecting it to a real engagement.

Fix: Add a one-sentence caption identifying the engagement type, industry, and what this workflow does. This transforms it from a visual demonstration of technical capability into implementation proof.

If a real caption cannot be written because the workflow is generic/illustrative rather than based on an actual engagement, replace it with a static workflow screenshot from an actual n8n canvas, anonymized, with a caption.

### What Imagery Should Communicate

- Operational environments: documents on desks, audit materials, workflow maps, system interfaces — things that exist in the operational world where the work happens
- The operator working: not a posed headshot, but someone in the context of systems work — review materials, code, documentation
- Clarity of process: visual organization, structure, named systems — not chaos imagery

### What Imagery Must Avoid

- Stock team collaboration imagery (generic)
- "AI brain" or neural network aesthetics
- Dark tech surfaces with glowing elements
- Abstract representations of "connection" or "flow"
- Any imagery that could appear on an unrelated SaaS product page

### Diagrams: When They Help vs. Hurt

Diagrams help when:
- They represent a real system that was built
- They are captioned with the operational context
- They make a process visible that is otherwise difficult to describe in text
- They reduce the word count of a process explanation

Diagrams hurt when:
- They are decorative representations of abstract concepts
- They require explanation to understand
- They imply technical sophistication without demonstrating operational specificity
- They could be lifted unchanged and placed on a competitor's site

### Operational Relief Visualization

Operational relief should not be visualized with before/after imagery or illustrated contrast. It should be delivered textually with enough specificity that the visitor constructs the mental image themselves.

Exception: a simple before/after data table (step count, cycle time, dependency count) is appropriate and trust-building when anchored to a specific engagement. This is data visualization, not conceptual illustration.

---

## Part 5: About Page Operator Trust Architecture

### Governing Principle

The About page sells the relationship before it sells the company. For a one-operator firm, the visitor's primary trust question is: "Is this someone I trust to understand and work inside my operation?" The page must answer this question before it answers any other.

### Proposed Section Order

**1. Operator Identity (above fold)**  
Purpose: establish who the visitor is trusting before they learn what the company offers.  
Content: name, photo, one-sentence professional identity. Not a bio. Not a list of credentials. One sentence that names what John sees, what he has spent time understanding, and what he built IntraWeb to address.  
Visual: a photo. Real, current, in a working context. Not a formal headshot. Not a logo placeholder.

**2. Origin Narrative**  
Purpose: give the visitor the specific professional experience that created this approach.  
Length: 2-3 short paragraphs.  
Structure: name the frustration first, then the observation, then the decision. Avoid career timeline format — this is not a resume section. The frustration should be specific enough that a reader who has experienced the same problem recognizes it immediately.  
What it must not become: a founder story with narrative arc and climax. It is an operational origin — a clear-eyed description of a problem seen repeatedly from the inside, and a practice built around solving it correctly.

**3. What IntraWeb Builds (condensed)**  
Purpose: connect the operator context to the service reality.  
Length: one short paragraph plus the six service area labels.  
Direction: let the operator section do the trust work, then deliver the service summary briefly. No repositioning needed here — the origin narrative has already done the framing.

**4. Why the Approach Is Different (comparison table — preserve)**  
Purpose: make the methodological distinction explicit.  
The current table is accurate and well-structured. Preserve it exactly. The only addition: a one-line introductory sentence before the table naming what most engagements get wrong.

**5. How Engagements Work (with engagement reality)**  
Purpose: enable operational imagination — the visitor should be able to picture what working together involves.  
Content: the five-step flow (intake → diagnostic → design → implementation → continuity) with additions:  
- Each step names what the client provides (access, time, information)  
- Each step names what the client receives at the end  
- Each step carries an approximate timeline signal  
- One or two sentences after the steps describe what the engagement relationship feels like over time — this is the emotional grounding

**6. What to Expect (elevated)**  
Purpose: honest, direct calibration of the working relationship. This section already exists and is well-written. Additions needed:  
- Elevate the "no account management layer" statement to the first bullet — it is the most trust-dense line in this section  
- Add one concrete description of how progress is communicated during active work  
- Add one line about what happens when something in the system breaks after delivery

**7. The 62 Workflows Statement**  
Purpose: implementation proof in the operator context.  
One line: "The systems I build for clients are the same systems I run internally. [n] production workflows currently running across [n] operational categories."  
This grounds the operator as a practitioner, not a consultant — someone who lives inside the operational systems they build.

**8. CTA**  
One line + one button. No pitch. No summary. "If this is the kind of engagement you're looking for, start with a conversation."

### Emotional Pacing

The About page should move through three emotional states:
1. Recognition (this is someone who has seen my problem from the inside)
2. Confidence (this person knows exactly how to approach it)
3. Readiness (I understand what working together involves, and I want to start)

The origin narrative delivers state 1. The comparison table and process section deliver state 2. The engagement reality and "what to expect" sections deliver state 3.

### What Should Remain Restrained

- Do not expand the origin narrative into a personal story with emotional beats
- Do not add client testimonials to the About page — the Operational Records handle that function
- Do not add credentials, certifications, or awards sections — they shift the trust signal from operational depth to credential performance
- Do not add a mission statement or values section

### What Should Become More Human

- The photo (currently absent)
- The origin narrative (currently five flat sentences)
- The engagement reality layer (currently five process-description bullets)
- The working relationship description (currently absent)

---

## Part 6: Conversion Flow Architecture

### Governing Model

The visitor's progressive trust journey has four states. The site must be designed to advance the visitor through all four before presenting a conversion moment.

State 1: Clarity — I understand what this company removes from my operation  
State 2: Recognition — My specific friction is named here  
State 3: Confidence — I have seen evidence that it has been removed in real environments  
State 4: Imagination — I can picture what working with this company would involve

Conversion is natural at State 4. Attempting conversion before State 3 is premature and produces low-quality leads. The conversion architecture below maps each page to which states it delivers and where conversion moments are placed.

---

### Homepage → Diagnostic (Primary Conversion Path)

| Scroll Position | State Delivered | Conversion Signal |
|----------------|-----------------|-------------------|
| Hero | Clarity | None — too early |
| Friction Grid | Recognition | Micro-signal only |
| Proof Cards | Confidence | Implicit only ("This starts with a Diagnostic") |
| Model | Understanding | None |
| Fit | Self-qualification | State 4 begins here |
| Trust Bar | Confirmation | State 4 deepens |
| CTA | State 4 complete | Primary conversion moment |

**Conversion logic:** The first CTA button the visitor is asked to act on in earnest should be at or after the Fit section — not before. Any CTA placed earlier should be present but not designed to attract attention. The primary CTA placement should be the last section before the footer.

---

### Homepage → Work/Proof (Trust-Seeking Path)

Visitors who click "See What Changed" from the hero or proof section are in recognition mode — they want more evidence before committing to a call.

The Work page must deliver:
- Evidence that the problems they recognized are documented in full operational detail
- Enough implementation specificity to establish that IntraWeb builds real systems (not just advises)
- A path back to booking a call from within each individual record

Conversion logic for this path: the Operational Record page (individual record view) carries a CTA after the "Current Operational State" section — at the emotional close of the record, when the relief has been delivered. This is the highest-intent conversion moment on the entire site for a trust-seeking visitor.

---

### Homepage → Services (Scope-Seeking Path)

Visitors who navigate to Services are trying to understand scope and cost before committing to a call. The current Services page fails this visitor because it cannot be self-navigated to a specific answer.

Post-restructuring, the Services page should deliver:
- State 1 and 2 quickly (the operational problem framing does this)
- Enough scope signal per engagement type to allow budget estimation
- A clear path to the Diagnostic as the appropriate next step for scoping

Conversion logic: Services → Diagnostic is the target path. "Not sure which fits? Start with a Diagnostic" is the right bridge and is already present in the current copy. It should appear at the end of each engagement type section, not only at the bottom of the page.

---

### About → Trust Reinforcement

Visitors who navigate to About before booking a call are in a verification state — they are close to conversion but need to confirm that the operator is credible and that the relationship makes sense for their situation.

The About page delivers trust reinforcement by:
- Providing a face and origin narrative (human confirmation)
- Providing the engagement reality layer (operational imagination)
- Providing the 62 workflows statement (practitioner confirmation)

Conversion logic: the CTA on About is the lowest-pressure conversion point on the site. The visitor is already close. The CTA should acknowledge this: "If the approach makes sense for your situation, a conversation is the right next step." The button is present but does not need to be prominent — a visitor who has read to the end of the About page is already highly motivated.

---

### Services → Diagnostic (Scope to Clarity Path)

A visitor who has reviewed the Services page and cannot self-qualify should be routed to the Diagnostic, not left to guess. The current "Not sure which fits? Start with a Diagnostic" language is the right bridge.

Reinforcement: this bridge should appear in three positions on the Services page — at the top (after the opening framing), after the automation/systems section, and at the bottom. The current version only appears at the bottom.

---

### Conversion Architecture Anti-Patterns (Forbidden)

- CTA before State 3 (Confidence) has been established — do not place a prominent booking button before proof
- Multiple competing CTAs on the same page — one primary, one secondary maximum per page
- Exit pop-ups, urgency timers, or any manufactured scarcity
- Generic CTAs: "Let's talk," "Get in touch," "Start your journey"
- Any CTA that requires the visitor to explain themselves before a path is clear (no "Tell us about your project" forms without a qualifying question first)

---

## Implementation Notes for Cursor

The following are architectural constraints that must be preserved across all implementation work:

**Navigation:** Standardize to a single nav structure across all pages. The homepage currently uses a different nav from Services and Diagnostic. Pick one — the Services/Diagnostic nav (Services / Work / About / Blog / Diagnostic / Contact) is more operationally complete.

**Page identity language:** All page meta descriptions, OG titles, and on-page positioning language must use a single consistent descriptor. Current inconsistency: homepage says "operational infrastructure," About meta says "AI-First Engineering Studio," Services footer says "AI systems and automation infrastructure for SMBs." Choose one master descriptor and apply globally.

**The Q2 availability badge:** Either update to a rolling availability indicator ("Currently accepting new engagements" with no quarter reference) or remove it. A stale quarter reference creates distrust faster than any missing content.

**The Work page:** The placeholder "Coming soon" copy must be replaced immediately. Even a single Operational Record in the correct format is preferable to an empty page that every other page on the site links to.

**The Diagnostic page calendar embed:** Verify the Cal.com embed renders and is functional. If it does not render on the live page, the primary conversion path on the highest-intent page is broken. This is a P0 fix.

---

## Anti-Drift Reference (Operational During Implementation)

Three tests to apply to every section during copywriting:

**Test 1 — Specificity Test:** Can this sentence be removed without losing a specific operational fact? If yes, it is likely manifesto material. Cut it or replace it with a fact.

**Test 2 — Attribution Test:** Could this sentence appear unchanged on any other operational consulting or AI agency website? If yes, it is not differentiated. Rewrite it with IntraWeb-specific specificity.

**Test 3 — Visitor State Test:** Does this content advance the visitor from their current state (Clarity / Recognition / Confidence / Imagination) to the next state? If not, what state is it serving? If it serves no state, it should not be on the page.

---

*IntraWeb Technologies — Site Execution Architecture v2.0*  
*Status: Implementation-ready. Proceed to section-by-section copywriting in priority order.*  
*Priority order defined in Blueprint v1.0, Execution Priorities table.*
