# 07 — When to stop and ask

**Onboarding tier:** 30-minute operational understanding
**Severity:** Procedural — escalation is not optional when triggers fire
**Audience:** Anyone working in this repository.

---

## Why this document exists

The governance documents in this directory cannot enumerate every
possible decision a contributor will face. The doctrine they protect
is perceptual and resists complete formalization. There will be cases
where the rules are ambiguous, where two rules appear to conflict, or
where the situation is novel.

In every such case, the answer is the same: stop, do not resolve it
unilaterally, and open a governance issue.

This document defines the triggers, the procedure, and the conditions
under which a decision returns to the contributor.

The procedure is not bureaucratic. It exists because uncertain decisions
resolved silently produce drift, and drift produced silently is the
failure mode the architecture is designed to prevent.

---

## Triggers — when to stop

The following conditions trigger a stop. If any of them apply, do not
proceed with the change.

### T-01 — A new file in `src/components/` does not match an approved pattern

The approved patterns are listed in `02-approved-abstractions.md`.
If a contemplated file does not match one of those patterns, the
file must not be created without governance review. This includes:

- A new shared component, primitive, or utility
- A new directory under `src/components/snapshots/`
- A new file in `src/components/snapshots/_primitives/` beyond
  `AnnotationLabel.tsx`
- A new file at any path that the existing five abstractions do
  not describe

### T-02 — A single commit touches multiple protected directories

If a planned commit would modify files in two or more of the
protected directories listed in `06-review-checklist.md`, stop.
The commit may be legitimate, but a multi-directory change is
the signature of an abstraction extraction pattern (F-17, S-01)
and requires governance review before merging.

The procedural fix is often to split the commit into per-directory
commits, each of which is reviewable in isolation. The governance
fix is the question of whether the underlying change should
happen at all.

### T-03 — A refactor reduces total line count by more than 20%

In any protected directory, a refactor that removes more than 20%
of the directory's lines is presumed to be an abstraction extraction
until verified otherwise (D-09). Stop and open a governance issue
that documents:

- What was removed and where it went
- Whether the extraction is one of the five approved abstractions
- If new, why a sixth abstraction is justified

The threshold is heuristic. Small directories trigger it on small
changes. Large directories require larger changes to trigger it.
The reviewer applies judgment; the trigger forces the conversation.

### T-04 — Any change to spacing tokens across more than one section

Spacing tokens are per-section. A change that touches two or more
sections' spacing simultaneously is the signature of unification
(F-08). Stop and open a governance issue. The legitimate cases
exist (e.g. a sharpening of the doctrine that genuinely revises
multiple sections) but they are doctrine-level decisions, not
implementation cleanups.

### T-05 — Any change to the annotation primitive API

`AnnotationLabel` accepts three props: `position`, `text`, `weight`.
Any change to that surface is forbidden until governance review
approves it (F-12). Stop and open a governance issue.

### T-06 — Any change to a governance or doctrine document

Files under `docs/doctrine/`, `docs/governance/`, and
`implementation-governance/` are not modified through ordinary PRs.
Stop, open a governance issue, and wait for doctrine review.
Reference the four conditions in `00-read-this-first.md` under
"Architecture is frozen" — those are the only conditions under
which governance changes are warranted.

### T-07 — A rule in this directory seems wrong for your specific case

This is the most common trigger and the most important one to honor.
Rules that seem wrong are sometimes right and sometimes wrong. The
contributor cannot tell which from inside their own decision. The
governance issue is the mechanism for finding out.

A contributor who proceeds on the assumption that the rule does not
apply to their case will eventually be right and eventually be wrong.
The wrong cases are the failures the architecture is designed to
prevent.

### T-08 — Two governance documents appear to disagree

If two documents in this directory or in `docs/doctrine/` appear to
say different things about the same situation, stop. The conflict is
either:

- A genuine contradiction that needs governance resolution, or
- A misreading by the contributor that doctrine review will clarify

Either way, opening a governance issue is the response. Do not
choose which document to follow.

### T-09 — A reviewer flags a danger sign from `03-normalization-danger-signs.md`

A reviewer who flags a danger sign on a PR is invoking the stop
procedure. The contributor responds by addressing the flag, not by
arguing for the change without engaging with the flag. If the
flag is a false positive, the verification note explains why; if
it is real, the change is revised.

### T-10 — The commit scanner has flagged a commit and the verification
note acknowledges the change normalizes an authored property

The commit scanner produces signals, not blocks. When the verification
note acknowledges that the flagged change does, in fact, normalize
something authored, the change becomes a Tier C doctrine review
(per `06-review-checklist.md`). Stop the merge and route to doctrine
review.

---

## Procedure — what to do after stopping

### Step 1 — Stop work

Do not write more code on the change. Do not extend the change to
"finish the thought." Do not seek a workaround that avoids the
trigger by changing the change. The trigger fires for a reason.

### Step 2 — Open a governance issue

Create a GitHub issue tagged `governance-question`. The issue
includes:

- Which trigger fired (T-01 through T-10)
- A description of the change being contemplated
- A reference to the relevant doctrine and governance documents
- The specific question the contributor needs answered
- Any draft code or examples that illustrate the question

The issue is not a request for permission to proceed. It is a
request for doctrine clarification. The output is either a clear
answer or a refinement to the governance documents.

### Step 3 — Do not resolve the issue yourself

The contributor who opens the issue does not close it. The doctrine
reviewer (or a designated governance reviewer) closes it with a
written resolution. The resolution is referenced in any subsequent
PR.

The exception: if the contributor opening the issue is the doctrine
reviewer, the issue is still resolved with a written note, not
silently. The paper trail matters more than the role.

### Step 4 — Wait for resolution

The PR remains open or is closed pending resolution. The contributor
may work on other tasks. They may not work on the change that
triggered the stop until the governance issue resolves.

If the resolution is "proceed with the change as proposed," the PR
moves to review with the governance issue referenced. If the
resolution is "revise the change," the contributor revises and
resubmits. If the resolution is "do not make this change," the
PR is closed.

### Step 5 — Update governance if the resolution requires it

Some resolutions reveal a gap in the governance documents. If the
trigger fired because the documents were ambiguous, the resolution
includes an update to the documents. The update is a separate PR
(per T-06) that goes through doctrine review.

A governance update is not retroactive — it does not approve PRs
that were rejected before the update. It clarifies how future PRs
will be handled.

---

## Operating modes that bypass this procedure (forbidden)

The following operating modes are forbidden because they short-circuit
the procedure above:

### "I'll just push this and we can revert if it's wrong"

Push-then-revert is not the governance flow. The cost of catching
drift after merge is higher than the cost of catching it before merge,
because merged drift accumulates in subsequent commits and is harder
to extract. The procedure is to stop before merge, not to merge and
fix later.

### "I'll add a comment explaining why this is fine"

Code comments do not substitute for governance review. A comment
that says "this looks like a normalization but actually isn't"
documents the contributor's view; it does not resolve the question.
The governance issue is the mechanism for resolution.

### "The reviewer didn't catch it, so it must be fine"

A reviewer's missing a trigger does not retroactively invalidate the
trigger. If the contributor noticed the trigger should have fired
and did not flag it, the contributor has bypassed the procedure even
though the reviewer's approval looks like consent.

The procedure assumes good-faith review on both sides. A trigger
identified by either side stops the merge.

### "We discussed this in Slack/chat"

Real-time chat is not a governance venue. Decisions made in chat
that affect protected directories must be transcribed into a
governance issue before they take effect. Chat is appropriate for
quick clarification of unambiguous rules; it is not appropriate
for resolving stop-and-ask triggers.

### "The deadline doesn't allow for this"

Deadline pressure is not a governance exception. The architecture
is frozen specifically because deadline pressure is the most
common cause of drift. A trigger that fires under deadline pressure
is exactly the trigger that the procedure is designed to handle —
it is not the case that should be excepted from it.

---

## How long does resolution take

There is no formal SLA. In practice:

- Trivial clarifications: within a day, asynchronous
- Tier B-equivalent questions (rule application): within a few days
- Tier C-equivalent questions (doctrine clarification): a week or
  more, often requiring a doctrine review session

The contributor plans their work assuming variable resolution time.
The procedure is not the bottleneck — drift produced by skipping
the procedure is the bottleneck, because it requires unwinding work
that already shipped.

If a resolution is taking unusually long, escalate within the
governance issue. Do not work around it.

---

## What the contributor receives back

The doctrine reviewer's resolution is a written note in the
governance issue. It includes:

- A direct answer to the contributor's question
- The doctrine or governance reference that supports the answer
- An indication of whether the answer applies generally or only
  to this case
- Any required changes to the governance documents (created as
  separate PRs, not bundled with the contributor's change)

The contributor uses the resolution to proceed with the PR or to
close the PR if the resolution prevents the change.

---

## Templates

### Governance issue template (suggested)

```
Title: [governance-question] <short description>

Trigger fired: T-XX

What I'm trying to do:
<plain description of the change>

Why I stopped:
<which rule, document, or pattern triggered the stop>

Specific question:
<the question the resolution should answer>

Documents I've consulted:
- /docs/doctrine/<file>
- /implementation-governance/<file>

Draft (if applicable):
<code, diff, or example illustrating the question>
```

### Verification note template (suggested, for commit-scanner-flagged commits)

```
Commit scanner flagged: <vocabulary word>
This change does/does not normalize an authored property because:
<one or two sentences referencing the relevant doctrine document>

If "does":
This is a Tier C doctrine review per /implementation-governance/06-review-checklist.md.
Governance issue: #<number>
```

---

## When the procedure itself is wrong

If the procedure described in this document appears to be impeding
work in a way that is not protecting the doctrine, that is itself
a governance question. Open an issue tagged `governance-question`
with a description of the impedance and a proposed adjustment.

The procedure is not exempt from governance review. It is governed
by the same standards as the rest of the documents in this
directory: it changes when implementation evidence shows it is
wrong, not when it is inconvenient.

---

## Verification

This document is procedural. The verification is whether the
procedure is followed in practice. Indicators that it is being
followed:

- Governance issues exist in the issue tracker, with `governance-question`
  labels and written resolutions
- PRs in protected directories reference governance issues where
  applicable
- The commit log does not show silent merges of changes that should
  have triggered stops
- Doctrine reviewers can produce a written record of decisions made
  through the procedure

Indicators that it is not being followed:

- Governance issues do not exist or exist without resolutions
- PRs in protected directories merge without referencing the
  governance documents
- Doctrine reviewers cannot recall how a particular decision was
  made
- Drift in the codebase that no individual PR appears responsible for

The phase boundary review (P-04, P-05 in `06-review-checklist.md`)
audits both directions.

---

## Survivability risks

The most likely failure modes for this procedure over time:

- **Procedure perceived as bureaucratic** — contributors who treat
  governance issues as overhead will avoid triggering them. The
  doctrine reviewer counters this by responding quickly and producing
  resolutions that are educational, not punitive.
- **Doctrine reviewer becomes a bottleneck** — if all governance
  issues funnel through one person and that person is unavailable,
  work stalls. Either a backup reviewer is designated or the
  procedure must adapt. The adaptation is itself a governance
  question, not a workaround.
- **Triggers are not recognized** — contributors must know the
  triggers exist. The 30-minute onboarding tier and the
  `QUICK-REFERENCE.md` together cover this. New contributors who
  bypass governance because they did not know to look for it indicate
  an onboarding failure, not a malicious bypass.
- **Resolutions become permissive over time** — under pressure, a
  series of "yes, proceed" resolutions can erode the rules being
  enforced. The phase boundary review (P-04) audits the cumulative
  effect of resolutions across the phase.

---

## Assumptions and unresolved dependencies

- The `governance-question` issue label exists in the repository.
  This is configured in the repository configuration phase.
- A doctrine reviewer role is defined and assigned. Role assignment
  is project-level and not in this document's scope.
- The escalation timing (no formal SLA) is intentional. If timing
  becomes a recurring complaint, an SLA is added through governance
  review, not through informal practice.
- The templates in this document are suggested, not enforced. They
  may be moved to `.github/ISSUE_TEMPLATE/` in the repository
  configuration phase.
