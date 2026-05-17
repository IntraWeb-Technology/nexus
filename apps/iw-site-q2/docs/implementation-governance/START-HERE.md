# Start here

**Onboarding tier:** 5-minute understanding
**If you read nothing else, read this file.**

---

## What this repository is

This is the implementation repository for the IntraWeb Technologies homepage.
It is governed by perceptual doctrine that intentionally conflicts with standard
frontend best practice in specific layers. The homepage is an operational
perception system. Preserving that system under engineering pressure is the
primary architectural constraint of this codebase.

---

## The three things that cannot be normalized

These three decisions are frozen architecture. They are load-bearing.
Violating any of them collapses the perceptual system the homepage is built on.

**1. Snapshot files are individually authored artifacts.**
The seven operational snapshots (SN-01 through SN-07) in
`/src/components/snapshots/` are not instances of a shared component.
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

See `/implementation-governance/06-acceptable-inconsistency.md` for the
full boundary between load-bearing inconsistency and accidental drift.

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
| Junior maintainers | Layer 1 + Layer 2 | This file + QUICK-REFERENCE.md |
| Frontend contributors | Layer 2 | This file + QUICK-REFERENCE.md + relevant section governance doc |
| Governance reviewers | Layer 2 + Layer 3 | All of Layer 2 + relevant doctrine files |
| Doctrine authors | Layer 3 | All doctrine files + governance documents |

You do not need to read the doctrine files to work safely on most sections.
Layer 1 enforcement and the quick reference are sufficient for most contributions.
Reach for the doctrine files when the quick reference is ambiguous.

---

## If you are unsure about anything

1. Do not proceed.
2. Do not merge.
3. Open a GitHub issue tagged `governance-question`.
4. Do not resolve it yourself unless you are the doctrine reviewer.

The procedure exists so that uncertain decisions produce a paper trail
instead of silent drift.

---

## Where to go next

- **Before any PR:** Read `QUICK-REFERENCE.md`
- **Before touching a snapshot:** Read `05-snapshot-authoring-protocol.md`
- **Before touching the Proof section:** Read `/docs/doctrine/05-proof-section-governance.md`
- **If a rule seems wrong for your case:** Read `07-when-to-stop-and-ask.md`
- **Full doctrine (when needed):** `/docs/doctrine/01` through `06`