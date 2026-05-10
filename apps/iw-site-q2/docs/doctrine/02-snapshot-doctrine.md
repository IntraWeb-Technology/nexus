# 02 — Snapshot Doctrine
**IntraWeb Technologies — Diagnostic Snapshot System**
**Version:** 1.0
**Status:** Governing — applies to all operational evidence artifacts

---

## Scope

This document defines the diagnostic snapshot system used in the Proof section and wherever operational evidence artifacts appear across the site. It governs snapshot philosophy, visual grammar, annotation grammar, and the recognition calibration system that governs both.

This document does not govern layout, spacing, or section-level production behavior. See `05-proof-section-governance.md` for production constraints.

---

## Snapshot Philosophy

A diagnostic snapshot is a visual artifact that isolates a single operational friction condition and renders it in a form that produces immediate recognition in an operator who has experienced that condition.

A snapshot is not:
- A case study
- A workflow diagram
- A systems architecture map
- A before/after comparison
- A dashboard or data visualization
- An infographic

A snapshot is a captured fragment of organizational friction. It renders one condition, specifically enough to trigger recognition, abstractly enough to remain universally applicable.

The distinction between a snapshot and a case study: a case study says "here is what we did for Company X." A snapshot says "here is an operational condition you recognize because your organization behaves this way too."

That shift moves the trust mechanism from social proof to operational recognition. Recognition is the stronger mechanism for this buyer.

---

## The Recognition Corridor

Every snapshot must operate within a recognition corridor defined by two walls.

**Floor — operational recognizability**
The minimum specificity required for a visitor to see their organization in the artifact. Below this floor, the snapshot is too abstract to trigger recognition. It reads as theoretical.

**Ceiling — structural universality**
The maximum specificity allowed before the artifact starts feeling like a specific client's situation. Above this ceiling, the snapshot reads as a case study or testimonial.

The corridor between these walls is narrow. Both walls must be actively maintained. Snapshots drift toward the ceiling under pressure to be specific. They drift toward the floor under pressure to be elegant or consistent.

---

## Recognition Calibration System

Recognition Calibration is the governing authority over Visual Grammar and Annotation Grammar. It is a perceptual test, not a compliance checklist.

**Primary test**
Would someone who runs operations at a 20–150 person company look at this artifact and feel located?

Located means: "That's the exact condition we keep running into."
Not: impressed, educated, or intellectually stimulated. Located.

**Secondary test**
Does this artifact feel experienced or conceptualized?

Operationally experienced artifacts contain: asymmetry, friction, interruption, dependency, workaround behavior, human concentration, informal coordination, failure accumulation.

Conceptually modeled artifacts tend to be: symmetrical, perfectly categorized, abstraction-heavy, terminology-driven, framework-oriented, visually resolved.

If the artifact passes the primary test internally but fails with an external operator, the secondary test has identified false-positive recognizability — a condition where systems-fluent internal reviewers recognize the concepts but external operators cannot locate their organization in the artifact.

**Governing register**
Operationally observed. Not creatively interpreted. Not intellectually modeled.

---

## Operational Asymmetry Doctrine

Real operational conditions are structurally uneven. Bottlenecks cluster. Dependencies accumulate asymmetrically. Communication paths distort. Manual intervention concentrates around specific people or processes.

Asymmetry in a snapshot is not a style choice. It is an accuracy requirement.

**What operational asymmetry looks like:**
- Nodes carrying unequal load
- Path weight varying by operational significance
- Concentration of connections at bottleneck nodes
- Broken or dead-end paths that do not resolve
- Stalled accumulation on one side of a gap
- Near-identical parallel tracks that never connect

**What normalized symmetry signals:**
- The diagram was constructed, not extracted
- The condition was modeled, not observed
- The artifact is theoretical, not evidential

**Anti-resolution pass for visual grammar:**
Before any snapshot is approved, review it for accidental normalization. Ask: "What operational unevenness was accidentally smoothed out during production?" Restore it.

Resolution is a failure mode, not a quality signal, in this system.

---

## Annotation Grammar

Annotation grammar is parallel in authority to visual grammar. Theoretical drift typically enters through language before it enters through form.

**Labels must name operational consequences, not infrastructure categories.**

Failing register (infrastructure categories):
- CRM
- Workflow engine
- Orchestration layer
- Support routing
- Data synchronization
- Cross-functional coordination gap
- Single point of failure

Correct register (operational consequences):
- Approvals stall after handoff
- Lead ownership changes twice before follow-up
- Customer replies disappear between systems
- Reporting depends on spreadsheet exports
- Support escalations happen in Slack DMs
- Same task recreated across teams
- Manual intervention required to close workflow
- Onboarding breaks when one person is unavailable

**Labels must sound operationally lived-in, not architected.**

The test: does this label sound like something an operations manager said in a post-mortem? Or does it sound like something in a systems design document?

Post-mortem register passes. Systems document register fails.

**Anti-resolution pass for annotation grammar:**
Before any snapshot is approved, review every label. Ask: "What operational specificity was accidentally abstracted?" Restore it.

**Tense rule:** All annotation labels present tense. Not "ownership changed" — "ownership changes twice before follow-up." Present tense signals current condition. Past tense signals historical case study.

**Consistency rule:** Consistency across artifacts is subordinate to specificity within each artifact. If enforcing label consistency requires abstracting a label, consistency loses.

---

## Allowed Visual Structures

These are the approved pattern types. Each is tied to a specific class of operational failure geometry.

**Broken sequence**
A linear path with a visible gap or dead-end. The gap is the artifact — not the nodes on either side. Used for: handoff failures, ownership gaps, process interruptions.

**Overloaded hub**
A hub-and-spoke pattern where one node carries disproportionate connections. The hub should look visually strained. Used for: single-person dependencies, knowledge concentration, informal routing bottlenecks.

**Disconnected nodes**
Multiple isolated nodes with no connecting tissue between them. A message or task exists in multiple places simultaneously with no clear path forward. Used for: coordination failures, tool fragmentation, routing ambiguity.

**Parallel isolation**
Three or more tracks running alongside each other, internally coherent, never connecting. Near-identical but with slight variations. Used for: invisible duplication, siloed process recreation.

**Forced convergence**
Multiple source nodes feeding into a single manual assembly point. The assembly point carries disproportionate input load relative to output. Used for: manual reporting dependencies, single-person assembly bottlenecks.

**Interrupted sequence with degraded resumption**
A linear path that pauses, then resumes with visibly reduced momentum. Used for: reassignment delays, capacity bottlenecks, ownership transitions.

**Formal/informal bifurcation**
A formal path that terminates early, with a secondary informal path branching sideways. The informal path accumulates more steps than the formal one. Used for: workaround systems, Slack-as-routing, unofficial escalation chains.

---

## Forbidden Visual Patterns

These patterns fail because they shift the register from operational evidence toward another category.

**Clean process flows**
Imply the system works as designed. Circular diagrams, flowcharts with happy-path resolution, swimlanes suggesting intentional routing — all fail because they show designed systems, not broken ones.

**Symmetric node distribution**
Signals constructed artifact. If nodes distribute evenly, the diagram was built by a designer, not extracted from an operational condition.

**SaaS dashboard aesthetics**
Metric callouts, data visualization components, progress indicators, status badges — all shift toward product UI register.

**Abstract node art**
Nodes that represent concepts rather than operational entities. Abstraction rises above recognition threshold. Visitor sees a framework, not their organization.

**Futuristic UI treatment**
Glows, gradients, particle effects, animated data flows. Shift register to tech marketing. Destroy forensic quality immediately.

**Before/after pairs as proof**
Imply transformation narrative. The snapshot system shows a current condition, not a transformation story.

---

## Approved Snapshot Vocabulary

The following snapshots have passed pressure-testing against the recognition corridor and doctrine. They are approved for production use.

---

### SN-01 — Approvals Stall After Client Handoff

**Operational condition:** Deal closes, ownership transfers, nothing defines what happens next. The person with authority isn't in the loop. Approvals that were fast during sales now take days.

**Recognition trigger:** The structural silence between close and kickoff.

**Primary visual tension pattern:** Silent dead-end

**Dominant failure shape:** Linear sequence that breaks — clean path on pre-handoff side, stalled accumulation on post-handoff side

**Emotional recognition trigger:** The project that "started" but didn't move for a week

**Recurring geometry category:** Broken sequence with asymmetric accumulation

**Asymmetry to preserve:** Stalled side accumulates weight. Pre-handoff side looks clean and resolved. That contrast is the recognition signal.

**Scan-layer behavior:**
- 3 seconds: broken sequence, visible gap, weight accumulation on one side
- Full read: labels naming what's waiting, who changed, what was never defined

**Annotation examples:**
- Correct: "deal closed / owner changes / no defined next step / approval request sent / no response / client follows up"
- Correct: "client waiting — no one owns the follow-up"
- Failing: "Sales → Handoff → Delivery → Approval → Kickoff"
- Failing: "cross-functional coordination gap"

---

### SN-02 — Onboarding Depends on One Person

**Operational condition:** A single employee holds the onboarding sequence in their head. When they're unavailable, the process pauses. What looks like a system is one person's memory on repeat.

**Recognition trigger:** "Just ask [name], they handle all of that."

**Primary visual tension pattern:** Overload concentration

**Dominant failure shape:** Hub-and-spoke with overloaded central node — more connections than it should carry, unevenly weighted spokes

**Emotional recognition trigger:** The panic when that person is out sick before a client kickoff

**Recurring geometry category:** Overloaded hub, dependency clustering

**Asymmetry to preserve:** Central node visually strained. Surrounding nodes lighter. System looks functional until it suddenly isn't — that latent fragility must be visible.

**Scan-layer behavior:**
- 3 seconds: one node carrying everything, obvious imbalance
- Full read: labels showing what routes through that node and what breaks when it's removed

**Annotation examples:**
- Correct: "all questions route to Sarah / Sarah unavailable / process paused / client follow-up delayed 3 days"
- Correct: "onboarding sequence exists in one person's head"
- Failing: "single point of failure / knowledge concentration / dependency risk"
- Failing: "undocumented process / knowledge management gap"

---

### SN-03 — Customer Replies Disappear Between Systems

**Operational condition:** A customer reply lands in an inbox, gets seen, and then stops moving. It exists in multiple places simultaneously. No one dropped it intentionally — it just had no defined path forward.

**Recognition trigger:** "I thought you were handling that."

**Primary visual tension pattern:** Routing ambiguity

**Dominant failure shape:** Message appearing at multiple disconnected nodes, no clear owner, one path ending in dead-end, another looping back to start

**Emotional recognition trigger:** Everyone thought someone else handled it

**Recurring geometry category:** Disconnected nodes, stalled accumulation without movement

**Asymmetry to preserve:** Message should appear at multiple points without progressing. Accumulation without movement. The visual should feel like something stuck, not something missing.

**Scan-layer behavior:**
- 3 seconds: disconnected nodes, message going nowhere, visible dead end
- Full read: labels showing where handoff was assumed but never assigned

**Annotation examples:**
- Correct: "reply received / seen in inbox / not logged in CRM / support ticket not created / customer follows up — day 3"
- Correct: "message existed — no one owned the next step"
- Failing: "communication gap / system integration failure / data synchronization issue"
- Failing: "coordination leakage" [NOTE: analytical framing, not observed condition — fails secondary recognition test]

---

### SN-04 — Support Escalations Routed Through Slack

**Operational condition:** Support rep hits a decision boundary, posts in a Slack channel, someone gets tagged, response comes hours later. Issue resolves but nothing gets logged. The Slack channel exists because the routing system doesn't work.

**Recognition trigger:** Any team with a channel called #escalations, #urgent, or #client-issues.

**Primary visual tension pattern:** Routing ambiguity / formal-informal inversion

**Dominant failure shape:** Formal path terminating early, informal path branching sideways and accumulating more steps than the formal path

**Emotional recognition trigger:** The Slack channel that exists because nothing else works

**Recurring geometry category:** Bifurcated path, formal/informal inversion

**Asymmetry to preserve:** Informal path accumulates more nodes and handoffs than the formal path. The inversion — more friction on the workaround than the designed system — is the recognition signal.

**Scan-layer behavior:**
- 3 seconds: formal path breaks, informal path takes over, visible sprawl
- Full read: labels showing exactly where the formal system ended and the workaround began

**Annotation examples:**
- Correct: "support rep hits decision boundary / no defined owner / posted in Slack / tagged three people / response — 6 hours later / issue resolved, nothing logged"
- Correct: "the answer lived in a Slack thread nobody can find now"
- Failing: "escalation path undefined / informal communication channel / knowledge capture failure"
- Failing: "undocumented resolution workflow"

---

### SN-05 — Same Task Rebuilt by Multiple Teams

**Operational condition:** Marketing, sales, and operations each built separate processes for the same underlying task. No coordination. No awareness of the others. The company now maintains three versions of the same work, each owned by someone who believes theirs is the real one.

**Recognition trigger:** "Wait, we already have something for that."

**Primary visual tension pattern:** Invisible duplication

**Dominant failure shape:** Three parallel tracks, internally coherent, no connection points, near-identical with slight variations

**Emotional recognition trigger:** Discovering you built something that already existed twice

**Recurring geometry category:** Parallel isolation, near-identical divergence

**Asymmetry to preserve:** Tracks should be almost but not quite identical. Small variations in node count and label specificity. Near-similarity is more unsettling than complete divergence — it shows parallel effort that never found itself.

**Scan-layer behavior:**
- 3 seconds: three parallel tracks, obvious structural repetition, no connection points
- Full read: labels showing the slight variations — where each team made a different decision about the same underlying task

**Annotation examples:**
- Correct: "marketing version / sales version / ops version / same data, three exports / three owners, none aware of the others"
- Correct: "three teams solving the same problem, none of them knowing"
- Failing: "siloed workflows / redundant process infrastructure / cross-functional alignment gap"
- Failing: "organizational fragmentation / process redundancy"

---

### SN-06 — Reporting Depends on Manual Assembly

**Operational condition:** Every Monday someone spends two hours copying numbers from four spreadsheets into a fifth, formatting it, and sending it to leadership. If that person is unavailable, the report doesn't exist. Leadership makes decisions on data assembled by hand, filtered through one person's interpretation.

**Recognition trigger:** The spreadsheet only one person knows how to update.

**Primary visual tension pattern:** Dependency concentration

**Dominant failure shape:** Many-to-one manual convergence — multiple sources feeding a single human assembly point, disproportionate input load producing a single simple output

**Emotional recognition trigger:** "If she's out, the report doesn't exist."

**Recurring geometry category:** Forced convergence, human bottleneck node

**Asymmetry to preserve:** Assembly node should look visually disproportionate to the output it produces. Heavy input load, significant human friction, single artifact output. The cost of production invisible until mapped.

**Scan-layer behavior:**
- 3 seconds: multiple inputs converging on one manual point, single output
- Full read: labels showing the human time, the dependency, the downstream decision-making built on it

**Annotation examples:**
- Correct: "four spreadsheets / copied manually every Monday / two hours / one person knows the format / leadership decision made Tuesday"
- Correct: "if she's out, the report doesn't exist"
- Failing: "manual data aggregation / reporting infrastructure gap / analytics pipeline dependency"
- Failing: "single point of failure in reporting workflow"

---

### SN-07 — Lead Follow-Up Delayed by Reassignment

**Operational condition:** A lead gets assigned to a rep who is over capacity, on vacation, or has left. The lead sits. No rule exists for what happens next. Someone notices, reassigns it, follows up four days after initial inquiry. The lead has already talked to two competitors.

**Recognition trigger:** CRM leads in "new" status that are three days old.

**Primary visual tension pattern:** Stalled queue

**Dominant failure shape:** Linear path with weighted pause node, resumed path that looks visually degraded — same structure, reduced momentum

**Emotional recognition trigger:** The lead that went cold while sitting in someone's queue

**Recurring geometry category:** Interrupted sequence, momentum degradation

**Asymmetry to preserve:** Pause interval visually explicit — a weighted node accumulating time, not a gap in the diagram. Post-reassignment path should feel visually different from pre-assignment path. Same structure, less forward momentum.

**Scan-layer behavior:**
- 3 seconds: linear path, visible stall, resumed path that looks slightly wrong
- Full read: labels showing the specific days, the capacity condition, the competitor timing

**Annotation examples:**
- Correct: "lead assigned / rep at capacity / no follow-up rule / day 1 / day 2 / day 3 / reassigned / lead already spoke to competitor"
- Correct: "four days passed before anyone said hello"
- Failing: "lead routing inefficiency / CRM assignment gap / pipeline velocity issue"
- Failing: "suboptimal lead response time"

---

## What Makes a Snapshot Believable

- Asymmetry is visibly motivated by the operational condition, not by design preference
- Labels sound like something said in a meeting, not written in a document
- The condition depicted is specific enough to be uncomfortable
- A visitor who has experienced the condition would say "yes, exactly" — not "interesting"
- The diagram shows where friction accumulates, not how the system is supposed to work
- Present tense throughout — the condition is ongoing

---

## What Makes a Snapshot Drift Into SaaS Diagrams

- Clean, resolved visual structure suggesting the system functions as designed
- Consistent node sizing and path weights applied across the diagram
- Metric callouts or status indicators attached to nodes
- Color coding by category rather than by operational significance
- Background shapes or containers organizing nodes into zones
- Any element that looks like it belongs in a product dashboard

---

## What Makes a Snapshot Drift Into Consultancy Frameworks

- Labels naming systems concepts rather than operational conditions
- Diagram attempting to show the complete system rather than a single friction point
- Visual structure that implies a recommended resolution path
- Annotation language that sounds like a gap analysis document
- Symmetrical, balanced layout suggesting planned architecture
- Any structure that a management consultant would present in a slide deck
