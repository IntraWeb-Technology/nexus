# Implementation governance — read this first

**Onboarding tier:** 30-minute operational understanding
**Purpose:** Index and architecture of the governance layer.
Explains what each document is for and how they relate.

---

## What this directory is

This directory defines what implementation actors — human or AI, current
or future — are forbidden from doing in this repository.

It is separate from the doctrine layer (`/docs/doctrine/`), which defines
what the system is trying to communicate. These are different responsibilities.

- Doctrine answers: what is the page trying to be?
- Governance answers: what is the codebase allowed to become?

Both are required. Neither substitutes for the other.

---

## The three-layer enforcement model

**Layer 1 — Repository enforces structure (mechanical)**
ESLint import rules, CODEOWNERS, PR template, commit scanner.
Runs without human attention. Survives complete maintainer turnover.

**Layer 2 — Governance explains intent (interpretive)**
This directory. Requires reading. Survives turnover proportionally
to how well contributors are onboarded.

**Layer 3 — Doctrine explains perception (foundational)**
`/docs/doctrine/`. Required only for governance decisions, new snapshot
authoring, and doctrine review checkpoints.

A contributor operating at Layer 2 with Layer 1 running is protected
from the most dangerous drift patterns. Full doctrine understanding
is not required for safe day-to-day contribution.

---

## Architecture is frozen

The governance architecture was finalized before Phase 1 implementation began.

Architecture changes now require evidence, not curiosity. A change to
this governance layer is only warranted when:

- Implementation exposes a real failure the current rules do not cover
- A governance contradiction appears between two documents
- Survivability testing fails on a specific artifact
- SN-01 or another snapshot reveals an unanticipated normalization vector

Do not open governance architecture discussions during active implementation.
Open a tagged issue, defer it, and address it at a phase boundary.

---

## Document index

| File | Onboarding tier | Purpose |
|------|----------------|---------|
| `START-HERE.md` | 5-minute | Entry point. Three things that cannot be normalized. |
| `QUICK-REFERENCE.md` | 30-minute | All CRITICAL rules, forbidden commits, stop-and-ask list. |
| `00-read-this-first.md` | 30-minute | This file. Governance architecture and index. |
| `01-forbidden-refactors.md` | 30-minute | Complete forbidden refactor and file name list. |
| `02-approved-abstractions.md` | 30-minute | Full spec for every permitted shared construct. |
| `03-normalization-danger-signs.md` | 30-minute | Code smell detection patterns. |
| `04-section-specific-warnings.md` | 30-minute | Per-section build rules for high-risk sections. |
| `05-snapshot-authoring-protocol.md` | Deep doctrine | Snapshot file structure, geometry rules, mobile protocol. |
| `06-review-checklist.md` | 30-minute | Pre-merge review process and doctrine checkpoints. |
| `07-when-to-stop-and-ask.md` | 30-minute | Escalation procedures. |
| `inverted-vocabulary.md` | 30-minute | Why normal words mean erosion here. |
| `acceptable-inconsistency.md` | Deep doctrine | Load-bearing vs accidental unevenness. (Mirror of `/docs/doctrine/06`) |

---

## Milestone model

This project does not follow a standard design → build → launch sequence.
The actual milestone structure is:

1. Doctrine stabilized ✓
2. Governance stabilized ✓
3. Implementation constraints stabilized ✓
4. SN-01 survivability proven (Phase 1 gate)
5. Mobile reconstruction survivability proven (Phase 2 gate)
6. Repository entropy controls operational ✓
7. Implementation begins
8. Phase 1 complete — tension architecture (Hero, Friction, Argument)
9. Phase 4 complete — Proof section
10. Launch

Steps 1–3 and 6 are complete. Step 7 is the current gate.