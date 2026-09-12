# Start here

**Onboarding tier:** 5-minute understanding
**If you read nothing else, read this file.**
**This file summarizes. It is not competing doctrine.**

---

## Positioning authority (Doctrine v2)

Canonical company identity lives in:

`/docs/doctrine/01-positioning-foundation.md` (Positioning Foundation v2)

Locked definition:

> IntraWeb Technology is a senior-led software engineering company that builds, integrates, modernizes, and stabilizes production systems.

Historical v1 (non-authoritative): `/docs/doctrine/legacy/01-positioning-foundation-v1.md`

A lower doctrine/governance level may never silently redefine Positioning Foundation v2.

---

## What this repository is

This is the implementation repository for the IntraWeb Technologies homepage.
It is governed by explicit build constraints that intentionally conflict with
standard frontend best practice in specific layers. The homepage has authored
decisions — in spacing, visual weight, component architecture, and section
boundaries — that must not be normalized. Preserving those decisions under
engineering pressure is the primary constraint of this codebase.

Website redesign and content-architecture remapping are out of scope until
human review of Doctrine v2 completes.

---

## The three things that cannot be normalized

These three decisions are frozen architecture. They are load-bearing.
Violating any of them removes an authored property the homepage depends on.

**1. Snapshot files are individually authored artifacts.**
The seven operational snapshots (SN-01 through SN-07) in
`/components/snapshots/` are not instances of a shared component.
They do not share rendering logic. They do not import from each other.
They do not share layout primitives. Each one is a standalone authored file.
Duplication between them is acceptable. Abstraction is not.

**2. Mobile is a separate recognition surface, not a scaled-down desktop.**
At least three snapshots (SN-02, SN-05, SN-06) require fully separate
mobile artifacts, not responsive scaling. Mobile layout decisions exist
to preserve operational recognition, not to preserve desktop geometry.

**3. Inconsistency in specific layers is load-bearing, not unfinished.**
Per-section spacing variance, annotation placement, visual weight imbalance,
and snapshot geometry asymmetry are authored decisions. They are not
technical debt. Do not normalize them.

See `/implementation-governance/acceptable-inconsistency.md` (mirror of
`/docs/doctrine/06-acceptable-inconsistency.md`) for the full boundary
between load-bearing inconsistency and accidental drift.

---

## What the repository will catch automatically

The following enforcement runs on every commit and every PR without
requiring human attention:

- ESLint will error if a snapshot file imports from a sibling snapshot file
- CODEOWNERS will block merges to protected directories without owner review
- The PR template will require doctrine justification for protected-area changes
- The commit scanner will warn when commit messages contain normalization vocabulary

These are not optional. They cannot be bypassed by skipping the checklist.

---

## Who operates at each layer

| Role | Primary layer | What they need to read |
|------|--------------|----------------------|
| CI systems | Layer 1 only | Nothing — runs automatically |
| AI implementation agents (Cursor) | Layer 1 + Layer 2 | `implementation-execution-contract.md` first. Then `QUICK-REFERENCE.md`. Positioning questions → Positioning Foundation v2. |
| Junior maintainers | Layer 1 + Layer 2 | This file + QUICK-REFERENCE.md |
| Frontend contributors | Layer 2 | This file + QUICK-REFERENCE.md + relevant section governance doc |
| Governance reviewers | Layer 2 + Layer 3 | All of Layer 2 + relevant doctrine files |
| Doctrine authors | Layer 3 | All doctrine files + governance documents |

You do not need to read the full doctrine set to work safely on most sections.
Layer 1 enforcement and the quick reference are sufficient for most contributions.
Reach for Positioning Foundation v2 when identity, buyer, proof metrics, or
cross-property (Schibelli.com) questions arise.

---

## If you are unsure about anything

1. Do not proceed.
2. Do not merge.
3. Open a GitHub issue tagged `governance-question`.
4. Do not resolve it yourself unless you are the doctrine reviewer.

Especially stop for: Positioning Foundation conflicts, unsupported metrics,
and IntraWeb ↔ Schibelli.com cross-property decisions
(see `07-when-to-stop-and-ask.md` T-11–T-13).

---

## Where to go next

- **Before any implementation work:** Read `implementation-execution-contract.md`
- **Before any PR:** Read `QUICK-REFERENCE.md`
- **Before touching a snapshot:** Read `05-snapshot-authoring-protocol.md`
- **Before touching the Proof section:** Read `/docs/doctrine/05-proof-section-governance.md` (HC-03: no unsupported quantitative proof)
- **If a rule seems wrong for your case:** Read `07-when-to-stop-and-ask.md`
- **Company identity / positioning:** `/docs/doctrine/01-positioning-foundation.md`
- **Site architecture:** `/docs/doctrine/intrawebtech-site-architecture.md` (canonical Site Architecture v2)
- **Full doctrine (when needed):** `/docs/doctrine/01` through `06` plus realism/register/governance docs
