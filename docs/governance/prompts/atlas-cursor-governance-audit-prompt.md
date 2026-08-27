# Exact Cursor Prompt — Atlas Governance V1 Audit

Copy everything inside the prompt block into Cursor Agent from the Atlas repository root.

```text
You are the principal engineering auditor for Atlas. Perform a READ-ONLY governance audit of this repository against “Atlas AI-Assisted Engineering Governance — V1.”

Your assignment is to determine what the repository can prove today. This is not an implementation task.

NON-NEGOTIABLE OPERATING RULES

1. Do not create, edit, format, move, rename, delete, stage, commit, or push any file.
2. Do not install, add, remove, or upgrade dependencies.
3. Do not update Playwright snapshots or other visual baselines.
4. Do not change environment variables, CMS data/schema, secrets, DNS, domains, deployments, branch protection, CI settings, or any external system.
5. Do not start a production deployment or promote a preview.
6. Do not use destructive Git commands. Preserve the existing worktree exactly.
7. Do not print secret values. You may inspect variable names and configuration structure, but redact all values.
8. Do not infer compliance from filenames, comments, or agent summaries. Verify the operative configuration and code.
9. Do not fix findings during this audit. Remediation comes only after the audit is reviewed and explicitly authorized.
10. If a command could mutate the repository or an external system, do not run it. Record it as not safely verifiable.

GOVERNANCE AUTHORITY

First, locate and read the V1 governance document. Expected target:

docs/governance/atlas-ai-assisted-engineering-v1.md

Also check for equivalent governance files and Cursor/agent rules. If the V1 document is missing, record a BLOCKER finding and continue the audit against the embedded control summary below. If multiple policy files conflict, do not choose one silently; report the conflict with evidence.

Embedded V1 control summary:

- AI implements within an explicit task contract; humans retain product, design, content, exception, baseline, and release authority.
- Approved requirements govern behavior; approved Figma frames and design tokens govern visuals; approved copy/CMS content governs editorial meaning; versioned Strapi schemas/migrations/contracts govern CMS behavior; CI/deployment configuration governs operations.
- Authority conflicts and material ambiguity are stop conditions.
- The repository must enforce task scope, risk classification, stop conditions, evidence retention, ownership, and exceptions.
- Design implementation must trace to approved frames/tokens and prove desktop, tablet, mobile, 1024-pixel width, and changed-breakpoint boundaries.
- Visual baseline changes require intentional-change rationale, before/candidate/diff evidence, and human approval.
- Strapi changes must keep schema, migrations, fixtures, queries/population, normalization, TypeScript types, renderers, and tests aligned.
- Fixture mode and live-CMS mode are separate contracts and must be verified separately.
- Required release gates include lockfile install, lint/format policy, typecheck, tests, production build, critical Playwright journeys, route/link integrity, visual regression, CMS checks, review/ownership, and exact-commit deployment verification.
- Skipped, unavailable, flaky, environment-blocked, or subset-only checks are not passes.
- G2–G4 changes require a commit-linked evidence package. Production promotion requires named human approval.

AUDIT METHOD

Phase 1 — Establish repository facts

A. Report, without changing anything:
- repository root;
- current branch;
- HEAD commit SHA;
- whether the worktree is clean, modified, staged, or contains untracked files;
- package manager and lockfile(s);
- monorepo/workspace layout;
- Atlas application path;
- relevant Node/package-manager versions declared by the repository.

B. Discover applicable instructions and controls, including:
- AGENTS.md files and their scope;
- `.cursor/rules/**`, `.cursorrules`, or equivalent agent instructions;
- governance and architecture decision documents;
- issue/task templates;
- pull-request templates;
- CODEOWNERS or equivalent ownership rules;
- exception/waiver records;
- release/readiness records;
- package scripts;
- test and visual-regression configuration;
- CI/CD workflows;
- deployment configuration;
- Strapi schema, migration, fixture, query, and type locations;
- environment examples and documented data modes.

Use `rg`, `rg --files`, and read-only Git/package-manager commands where possible. Do not rely on a shallow filename search; inspect the contents and connections between controls.

Phase 2 — Audit the control domains

For every domain below, assign exactly one status:

- COMPLIANT — operative evidence satisfies V1.
- PARTIAL — a real control exists but does not fully satisfy V1.
- NON-COMPLIANT — the control is missing, contradictory, bypassable, or materially inadequate.
- NOT VERIFIABLE — evidence cannot be obtained safely or from the current environment.

Audit these domains:

1. Governance authority and discoverability
- Is one versioned governance contract authoritative and easy for humans and agents to find?
- Do rules establish that Cursor is an implementation agent, not product/design/content/CMS/release authority?
- Are authority conflicts and ambiguity explicit stop conditions?
- Are conflicting or obsolete policy files present?

2. Task intake and scope control
- Do durable task/issue/agent templates require objective, authorized scope, out-of-scope items, authority references, acceptance criteria, risk, verification, permitted subsystems, stop conditions, and reviewer?
- Can an agent begin material runtime work without these fields?
- Is risk classification operative or merely described?

3. Human ownership and exceptions
- Are design system, CMS schema/migrations, CI/CD, visual baselines, and production release protected by named ownership or required review?
- Is there an exception mechanism with rule, reason, risk, compensating control, owner, expiration, and approval?
- Is baseline or release self-approval by the implementing agent prevented?

4. Design-system contract
- Locate the governed design tokens, primitives, typography, spacing, color, breakpoints, and responsive conventions.
- Identify unexplained hard-coded visual values and duplicate token sources.
- Determine how implementation traces to approved Figma frames or design decisions.
- Confirm that loading, empty, error, focus, hover, and menu-open states are governed where applicable.
- Determine whether canonical viewports are centralized and consumed by tests/review.
- Explicitly check desktop, tablet, mobile, 1024-pixel width, and widths around changed breakpoints.
- Do not claim visual parity from source inspection.

5. Visual-regression governance
- Identify visual test suites, projects, snapshot locations, viewport definitions, thresholds, masking, retries, update commands, CI jobs, and artifact retention.
- Determine whether baseline updates are separated from validation and require human approval.
- Determine whether reviewers receive before/candidate/diff evidence.
- Look for broad thresholds, hidden snapshot churn, ignored visual failures, or workflows that can update and approve baselines without independent review.

6. Content/editorial governance
- Identify the source of approved production copy and how placeholders are prevented from reaching production.
- Determine whether headings, labels, excerpts, metadata, CTA text, and fallback copy are contract-tested where material.
- Check whether fallback behavior can hide missing or malformed CMS data.
- Check whether the story-first editorial structure is recorded as an enforceable decision rather than existing only in implementation.

7. Strapi/frontend contract
- Map each layer: Strapi schemas/components, migrations, seed or fixture data, fetch/query/population, normalization, TypeScript types, rendering, and tests.
- Identify drift, duplicate contracts, unsafe casts, hard-coded slugs/relations, undocumented optionality, and missing error behavior.
- Determine whether changes are classified as additive, compatible, breaking, or destructive.
- Determine whether migrations and recovery/rollback are required and enforced.
- Verify that fixture mode and live-CMS mode are distinct, documented, and tested.
- Check build behavior when Strapi is available, unavailable, stale, or returns malformed/missing required data.
- Check preview and production data-source selection without exposing secrets.

8. Code and dependency governance
- Determine whether repository boundaries and public interfaces are documented or enforced.
- Check for dependency approval controls, lockfile enforcement, unbounded refactors, lint/type/test suppressions, skipped tests, broad `any`, or ignored errors that can bypass evidence.
- Distinguish isolated examples from systemic control failures.

9. Test and CI enforcement
- Map every required V1 gate to the exact local script and CI job that enforces it.
- Inspect triggers, path filters, conditions, `continue-on-error`, allowed failures, skipped projects, retries, timeouts, caching, environment selection, and artifact retention.
- Determine whether pull requests and the protected/release branch are actually gated by lint/format, typecheck, unit/component tests, production build, critical Playwright journeys, link/route integrity, visual regression, and CMS checks.
- Repository workflow files prove configured CI behavior, not GitHub branch-protection settings. Mark external settings NOT VERIFIABLE unless authoritative evidence is available without mutation.

10. Release and deployment governance
- Determine whether release readiness is tied to an exact commit SHA.
- Determine whether the deployed artifact is traceable to that tested commit.
- Check preview verification, production smoke verification, rollback/recovery documentation, environment separation, domain configuration ownership, and named human promotion approval.
- Identify any path that can deploy while required checks are absent, skipped, stale, or associated with another commit.

11. Evidence package and auditability
- Determine whether G2–G4 changes retain the task contract, risk class, authority references, changed contracts, exceptions, command results, routes/states, visual proof, CMS mode, known failures, migration/rollback notes, approvals, candidate SHA, deployment identifier, and release decision.
- Verify evidence storage and retention, not just template wording.
- Determine whether a reviewer can reconstruct one recent material change from authorization through production.

Phase 3 — Run safe verification

Before running commands, inspect package scripts and CI to identify the repository’s real commands. Do not invent replacements.

You may run only existing, read-only/local verification commands that do not install dependencies, update snapshots, rewrite files, start deployments, mutate a CMS, or contact production systems. Prefer commands configured for deterministic local/fixture operation.

Potential checks include the repository’s existing:
- formatting check;
- lint;
- typecheck;
- unit/component test;
- production build in documented deterministic mode;
- route/link check;
- Playwright test in a documented local/fixture mode;
- visual comparison only when it cannot update baselines;
- CMS contract/schema validation that cannot mutate CMS data.

For every command run, record:
- exact command;
- working directory;
- environment/data mode, with values redacted;
- exit code;
- duration if available;
- concise result;
- whether it was the full required gate or only a subset.

If dependencies are missing, a service is unavailable, the command would contact production, or the check could mutate state, do not work around the restriction. Mark the gate NOT VERIFIABLE and state exactly what is needed to verify it safely.

EVIDENCE STANDARD

Every material finding must include:
- severity: BLOCKER, HIGH, MEDIUM, or LOW;
- control domain;
- status;
- requirement;
- observed evidence with repository-relative path and line number or exact configuration key;
- command evidence where applicable;
- concrete risk;
- smallest sufficient remediation outcome.

Do not report speculation as a finding. Label reasonable deductions as INFERENCE and show the facts supporting them. If evidence conflicts, show both sides.

Severity definitions:
- BLOCKER — production release or governed-workflow claim is unsafe or unsupported.
- HIGH — a material change can bypass authority, contract, verification, or release control.
- MEDIUM — control exists but is incomplete, inconsistently applied, or weakly evidenced.
- LOW — localized clarity, maintainability, or traceability weakness with limited immediate risk.

REQUIRED FINAL REPORT

Return one Markdown report with these sections, in this exact order:

# Atlas Governance V1 Audit

## 1. Executive verdict
- Overall verdict: GOVERNED, PARTIALLY GOVERNED, or NOT GOVERNED.
- Release-control verdict: READY, CONDITIONALLY READY, or BLOCKED.
- Five sentences maximum explaining the decisive evidence.

## 2. Audit identity
A table with repository root, branch, HEAD SHA, worktree state, package manager, Atlas app path, audit date/time, and limitations.

## 3. Control matrix
A table with all 11 audit domains, status, strongest evidence, largest gap, and severity.

## 4. Release-gate matrix
A table with each V1 release gate, local command, CI job, trigger/requiredness, latest audit result, evidence path, and verdict. Never convert NOT VERIFIABLE into PASS.

## 5. Findings
List findings in severity order. Give each a stable ID: GOV-B001, GOV-H001, GOV-M001, or GOV-L001. Include every evidence-standard field.

## 6. Atlas contract map
Show the actual repository paths for product/decision records, Figma/design references, tokens, CMS schema, migrations, fixtures, query/normalization, TypeScript types, renderers, tests, visual baselines, CI, deployment, and release evidence. Mark missing layers.

## 7. Commands executed
A table of exact commands and results. Include failed and partial commands. Redact secrets.

## 8. Current release blockers
List only evidence-backed blockers. For each, state the proof required to close it. If none, say “No blocker proven by this audit”; do not invent reassurance.

## 9. Prioritized remediation plan
Provide the smallest ordered plan that closes governance gaps. Separate:
- policy/control wiring;
- CI enforcement;
- design/visual governance;
- CMS contract governance;
- release evidence.

For every item give owner role, risk class, dependencies, acceptance evidence, and whether human judgment is required. Do not implement the plan.

## 10. Evidence appendix
Include concise excerpts or configuration facts sufficient for another engineer to reproduce the audit. Do not dump entire files or secret values.

FINAL QUALITY RULES

- Be direct. A document without enforcement is NON-COMPLIANT, not “mostly compliant.”
- A configured script without a required CI job is not an enforced release gate.
- A CI job that is conditional, allowed to fail, or skipped on relevant changes is not a required gate.
- A generated or updated snapshot is not visual approval.
- Fixture-only success is not live-CMS readiness.
- A preview URL is not production release approval.
- Existing failures and unverified checks must remain visible.
- Do not recommend a rewrite unless evidence proves incremental remediation cannot work.
- Stop after delivering the report. Make no repository changes.
```

