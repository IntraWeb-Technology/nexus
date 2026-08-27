# Atlas AI-Assisted Engineering Governance — V1

**Status:** Adopted V1 contract  
**Scope:** Atlas (`johnschibelli.dev`) design, application, content, CMS, testing, CI/CD, and release workflow  
**Applies to:** Human contributors, Cursor, ChatGPT, code-generation agents, review agents, and automation  
**Owner:** John Schibelli  
**Review trigger:** Any material change to the architecture, CMS contract, design authority, deployment model, or release gates

## 1. Purpose

Atlas uses AI to accelerate implementation, analysis, test creation, and documentation. AI does not own product intent, design intent, content truth, system contracts, or release approval.

This document defines how AI-assisted work becomes controlled production engineering. Its purpose is to make every change:

- explicitly authorized;
- bounded by an agreed task contract;
- traceable to an authoritative requirement;
- validated at the correct risk level;
- reviewable through evidence rather than agent confidence; and
- unable to reach production by bypassing required gates.

The governing principle is:

> AI may propose and implement. Authoritative artifacts define intent. Automated checks provide evidence. A human approves material judgment and production release.

## 2. Governance Outcomes

Atlas governance is working only when the repository can prove all of the following:

1. The agent knew what it was authorized to change.
2. The agent knew what it was forbidden to change.
3. Each implementation decision traces to an approved source.
4. Design, content, CMS, and code contracts remain aligned.
5. Relevant automated checks ran and their results were retained.
6. Visual changes were reviewed as visual changes, not hidden inside snapshot updates.
7. Release approval was made from current evidence for the exact commit being released.

Documentation alone is not enforcement. The repository must translate this contract into rules, templates, CI checks, ownership, and release evidence.

## 3. Roles and Decision Rights

### 3.1 Product and release owner

John Schibelli is the final authority for:

- product scope and user experience;
- approved copy and editorial direction;
- acceptance of design changes;
- exceptions to this governance contract;
- visual-baseline approval; and
- production release approval.

### 3.2 Authoritative artifacts

Approved artifacts define intent within their own domain:

| Domain | Authority | What it controls |
| --- | --- | --- |
| Product behavior | Approved requirement, task contract, or decision record | User journeys, route behavior, functional scope, acceptance criteria |
| Visual design | Approved Figma frames and Atlas design-system tokens | Layout, hierarchy, typography, spacing, responsive composition, interaction states |
| Editorial content | Approved production copy or CMS content | Meaning, voice, claims, labels, titles, metadata |
| CMS | Versioned Strapi schema, migration, and frontend content contract | Field names, types, relations, required/optional behavior, population, fallback behavior |
| Engineering | Versioned architecture decisions and repository conventions | Boundaries, data flow, supported patterns, dependency policy |
| Verification | Acceptance criteria and test specifications | Required evidence; existing tests do not redefine approved intent when stale |
| Operations | Versioned CI/CD and deployment configuration | Build, environment, preview, promotion, rollback, and release controls |

There is no universal “last file wins” rule. When authorities conflict, the agent must identify the domain conflict and stop for resolution. It must not silently choose the source that is easiest to implement.

### 3.3 AI implementation agent

Cursor and other AI agents may:

- inspect the repository and report evidence;
- implement an approved, bounded task;
- write or update tests required by that task;
- propose alternatives and identify risk;
- update documentation directly affected by the implementation; and
- run authorized local verification.

An AI agent may not independently:

- expand product scope;
- redesign approved layouts or reinterpret the editorial system;
- invent production copy, claims, CMS data, or missing requirements;
- change a public route or API contract outside the task;
- make a breaking CMS schema change or destructive migration;
- change authentication, authorization, secrets, DNS, domains, or production data;
- weaken, skip, delete, quarantine, or mark failing checks as optional to obtain a pass;
- regenerate visual baselines merely because a comparison failed;
- declare visual parity from code inspection alone;
- approve its own material exception; or
- promote a deployment to production.

### 3.4 Human reviewer

The reviewer confirms that:

- the task contract was followed;
- evidence supports the change;
- material judgment calls are explicit;
- visual changes match approved intent;
- CMS changes are compatible and reversible where required; and
- release gates apply to the exact candidate commit.

## 4. Required Task Contract

No implementation task begins from a conversational instruction alone when it can affect runtime behavior, layout, content contracts, CI/CD, or production. The task must first be expressed as a durable contract in the issue, work item, or agent prompt.

Every task contract must contain:

```text
Objective:
Authorized scope:
Explicitly out of scope:
Authoritative references:
Current behavior:
Required behavior:
Acceptance criteria:
Risk class:
Required verification:
Permitted files or subsystems:
Stop conditions:
Required reviewer or approval:
```

If a field is unknown and the missing answer could materially change the implementation, the agent must stop and ask. It may not convert ambiguity into an implementation assumption.

## 5. Change-Risk Classification

The highest applicable class controls the task.

| Class | Typical work | Minimum control |
| --- | --- | --- |
| G0 — Read-only | Audit, explanation, inventory | No mutation; evidence-backed report |
| G1 — Isolated | Copy correction, local style fix, non-runtime docs | Scoped diff, targeted checks, review |
| G2 — Integrated | Component behavior, route logic, shared design token, fixture contract | Task contract, relevant test suite, build, reviewer |
| G3 — Release-sensitive | CMS schema/data flow, CI, visual baselines, dependencies, security-relevant config, deployment behavior | Explicit approval, compatibility/rollback analysis, full release gates, retained evidence |
| G4 — Production/destructive | Production data mutation, secrets, DNS/domain, destructive migration, production promotion or rollback | Named human authorization immediately before action, exact target confirmation, recovery plan |

An agent must not split a G3 or G4 change into smaller commits to classify it as lower risk.

## 6. Mandatory Stop Conditions

The agent stops implementation and reports the blocker when any of these conditions occurs:

- approved sources conflict;
- the requested behavior is not defined by an authority;
- the change requires touching an explicitly excluded file or subsystem;
- unexpected user changes overlap the task;
- a CMS change could remove, rename, reinterpret, or orphan data;
- a visual mismatch cannot be resolved without making a design judgment;
- a test appears stale relative to approved intent;
- passing requires weakening a gate or updating a baseline without approval;
- credentials, external permissions, or production access exceed the granted scope;
- a command could destructively alter data or an external system;
- required verification cannot run or its environment is not representative; or
- the release candidate differs from the commit for which evidence was collected.

The report must state what was found, why work stopped, the decision required, and the safest next action.

## 7. Design-System Governance

### 7.1 Design authority

Approved Atlas Figma frames and the versioned design tokens jointly control visual implementation. Figma controls composition and responsive intent. Repository tokens control implementable values. A mismatch between them is a governance defect; the agent must not create an untracked third value.

### 7.2 Implementation rules

- Reuse approved primitives, tokens, and layout patterns before adding variants.
- Do not introduce one-off color, typography, spacing, radius, or breakpoint values when a governed token applies.
- Preserve semantic HTML and keyboard behavior while matching the design.
- Treat empty, loading, error, focus, hover, and menu-open states as part of the design contract.
- Production assets must have intentional crops, aspect ratios, alternative text, and responsive behavior.
- A design change and the code implementing it must trace to the same approved decision.

### 7.3 Responsive proof

Desktop, tablet, and mobile screenshots are necessary but not sufficient. Atlas must also validate the 1024-pixel boundary because it can expose navigation, grid, and typography failures between named layouts.

For every materially changed page or shared shell, retain evidence for:

- the approved desktop viewport;
- the approved tablet viewport;
- the approved mobile viewport;
- 1024-pixel width; and
- at least one width immediately on each side of any changed breakpoint.

The repository must define canonical viewport sizes in one versioned location. Tests and review instructions must consume those definitions rather than reproducing unexplained numbers.

### 7.4 Visual-baseline control

- A failed comparison is evidence of a difference, not permission to accept it.
- Baseline updates require an intentional-change explanation and human visual approval.
- Do not update baselines in the same step used to determine whether implementation is correct.
- Baseline review must show before, candidate, and diff images for affected views.
- Unrelated baseline churn blocks approval.
- The approved baseline must be tied to a commit and the environment used to render it.

## 8. Content and Editorial Governance

- Production copy comes from approved copy or CMS content, not agent invention.
- An agent may correct an obvious mechanical error only when meaning is unchanged and the task authorizes copy edits.
- Headings, labels, excerpts, metadata, and calls to action are contracts because they affect navigation, search, accessibility, and analytics.
- Placeholder content must never be silently promoted as production content.
- Content fallbacks must be deliberate, documented, and tested. A fallback must not conceal CMS contract failure in production.
- The story-first editorial structure is an approved product direction. Agents may not revert it to generic cards, numbered principles, or repetitive portfolio patterns for implementation convenience.

## 9. Strapi and Frontend Contract Governance

### 9.1 Contract ownership

The Strapi schema, migrations, seed/fixture model, query/population layer, normalization layer, TypeScript types, rendering components, and tests form one content contract. A change is incomplete if only one layer is updated.

### 9.2 Required controls

For any CMS-affecting task:

1. Identify whether the change is additive, compatible, breaking, or destructive.
2. Record affected content types, components, relations, queries, types, fixtures, routes, and tests.
3. Define behavior for missing optional data and failure for missing required data.
4. Preserve relation semantics and populated-field expectations.
5. Provide a migration and rollback/recovery approach for G3/G4 changes.
6. Verify fixture mode and live-CMS mode as distinct runtime contracts.
7. Confirm preview and production use the intended data source.
8. Never print or commit secrets while gathering evidence.

Fixture success does not prove live-CMS readiness. Live-CMS success does not remove the need for deterministic fixtures in tests. If Atlas is intentionally unavailable without Strapi, that behavior must be explicit and tested. If fallback is approved, it must be visible, bounded, and unable to mask stale or malformed production content.

## 10. Code and Dependency Governance

- Follow existing package boundaries, ownership, and public interfaces.
- Prefer the smallest change that fully satisfies the contract.
- Do not perform opportunistic refactors in the same task unless they are necessary and authorized.
- New dependencies require a stated need, maintenance/security assessment, bundle or runtime impact, and G3 review.
- Generated code must meet the same readability, type-safety, error-handling, accessibility, and test standards as human-written code.
- Suppressions such as `any`, ignored lint rules, skipped tests, broad catches, or snapshot churn require explicit justification and review.
- Agent-generated comments must explain non-obvious constraints, not narrate obvious code.

## 11. Verification Contract

Verification is selected by affected risk, not by what is fastest to run. Existing repository commands are authoritative; an agent must not invent a substitute and report it as the project gate.

### 11.1 Minimum evidence by change

| Change | Required evidence |
| --- | --- |
| Documentation only | Format/link check if available; scoped diff review |
| Copy or style | Lint/typecheck as applicable; affected route rendering; targeted visual proof |
| Component or route behavior | Lint, typecheck, unit/component tests, affected E2E journey, production build |
| Shared shell/token | All affected journeys, canonical responsive views, visual regression, production build |
| CMS contract | Schema/type/fixture checks, fixture build/tests, live-CMS contract verification in an authorized environment, failure-state test |
| CI or deployment | Configuration validation plus execution in the target pipeline or a representative dry run |
| Dependency | Lockfile review, full relevant test suite, build, security/license review as defined by the repository |

### 11.2 Evidence integrity

- Record the command, exit status, material failures, environment/mode, and candidate commit.
- A passing subset must be labeled as a subset.
- A skipped, unavailable, flaky, or environment-blocked check is not a pass.
- Pre-existing failures remain release risk and must be reported; they cannot be omitted because the current diff did not create them.
- Visual inspection must be identified as human or automated and must name the reviewed viewports.
- Never claim “all checks pass” unless every required gate for the risk class passed on the release candidate.

## 12. CI/CD and Release Gates

The protected branch and production workflow must enforce, at minimum:

1. clean dependency installation from the lockfile;
2. formatting/lint policy;
3. TypeScript validation;
4. unit/component tests;
5. production build in the governed data mode;
6. critical Playwright journeys;
7. link and route integrity for published navigation;
8. visual regression for governed pages and viewports;
9. CMS contract/availability checks appropriate to the release mode;
10. review of authorized schema or migration changes;
11. required human review and branch protection; and
12. deployment verification against the exact built commit.

A production candidate is blocked when:

- a required gate fails, is skipped, or did not run;
- live data behavior is unverified for a live-CMS release;
- visual diffs lack approval;
- required content or production assets are placeholders;
- secrets or environment configuration are unresolved;
- route, navigation, form, error, or accessibility-critical journeys fail;
- the evidence refers to a different commit; or
- rollback/recovery is undefined for a G3/G4 change.

Preview deployment is evidence, not release approval. Production promotion remains a named human decision.

## 13. Required Change Evidence Package

Every G2–G4 change must retain a compact evidence package in the pull request, work item, or release record:

```text
Task contract / issue:
Risk class:
Authoritative references:
Files and contracts changed:
Intentional deviations or exceptions:
Commands run and results:
Affected routes and states:
Responsive/visual evidence:
CMS mode and contract evidence:
Known failures or unverified items:
Migration/rollback notes, when applicable:
Reviewer approvals:
Candidate commit SHA:
Preview/deployment identifier:
Release decision:
```

Agent summaries are useful navigation, but the underlying commands, diffs, screenshots, and pipeline results are the evidence.

## 14. Exceptions

An exception must be explicit, narrow, time-bounded, owned, and visible in the release record. It must include:

- the exact rule being waived;
- the reason;
- the resulting risk;
- compensating control;
- owner;
- expiration or removal condition; and
- approval.

“The agent could not make the check pass” and “the deadline is close” are not sufficient exception rationales.

## 15. Repository Enforcement Requirements

V1 is adopted only when the repository implements these controls:

- a versioned governance document under `docs/governance/`;
- a concise Cursor rule that points to this contract and enforces scope, stop conditions, and evidence requirements;
- an agent/task template containing the required task-contract fields;
- a pull-request template containing the evidence-package fields;
- ownership rules for design system, CMS schema/migrations, CI/CD, and visual baselines;
- protected-branch required checks matching the release gates;
- canonical viewport definitions shared by visual tests and review;
- a controlled visual-baseline approval procedure;
- fixture-mode and live-CMS verification with clearly different commands or jobs;
- a release-readiness record tied to the candidate commit; and
- a documented exception register.

Recommended repository targets, subject to the existing structure:

```text
docs/governance/atlas-ai-assisted-engineering-v1.md
docs/governance/exceptions.md
.cursor/rules/atlas-governance.mdc
.github/ISSUE_TEMPLATE/engineering-task.yml
.github/pull_request_template.md
.github/CODEOWNERS
```

The filenames are less important than discoverability and enforcement. Parallel, conflicting policy files are not acceptable.

## 16. Adoption Sequence

1. Audit the current repository against this contract without changing files.
2. Resolve authority conflicts and identify current release blockers.
3. Add the versioned governance and Cursor rules.
4. Add task, pull-request, ownership, and exception controls.
5. Align CI jobs with the required release gates.
6. centralize canonical viewports and baseline approval.
7. prove fixture and live-CMS verification separately.
8. run one governed change end to end and retain its evidence package.
9. revise V1 only from observed friction or missing control, not agent preference.

## 17. Definition of Governed

Atlas may claim a governed AI-assisted production workflow when a reviewer can start from a released commit and reconstruct:

- why the change existed;
- who authorized its scope;
- which design, content, CMS, and engineering contracts controlled it;
- what the AI changed;
- what it deliberately did not change;
- which checks proved the result;
- who approved visual and release judgment; and
- how the exact commit reached production.

If that chain cannot be reconstructed, the workflow is AI-assisted but not governed.
