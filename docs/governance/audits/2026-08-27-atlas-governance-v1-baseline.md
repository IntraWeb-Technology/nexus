# Atlas Governance V1 Audit

## 1. Executive verdict

- **Overall verdict: PARTIALLY GOVERNED**
- **Release-control verdict: BLOCKED**

The V1 contract file `docs/governance/atlas-ai-assisted-engineering-v1.md` is missing. Atlas instead relies on Cursor rules, the Build Manifest, and GitHub `CI Gate` — a real but incomplete substitute. Production `nexus-atlas-web` was last deployed from feature branch `feat/atlas-story-first-resilience-chrome` at SHA `1b7d8c4f` via Cursor CLI (`source: cli`, actor `cursor-cli`), not from `main` after required review. That same tree currently fails lint and functional Playwright, and CI explicitly excludes visual regression. Fixture-mode unit tests and a fixture production build passed; live CMS was unreachable and is not a pass.

## 2. Audit identity

| Field | Value |
| --- | --- |
| Repository root | `C:/Users/jschi/Documents/ecosystem/nexus` |
| Remote | `https://github.com/IntraWeb-Technology/nexus.git` |
| Branch | `feat/atlas-story-first-resilience-chrome` (tracks `origin/feat/atlas-story-first-resilience-chrome`) |
| HEAD SHA | `1b7d8c4f3140758bc62fcf05e248524ec5d3c633` |
| HEAD subject / date | `feat(atlas): complete Story-First Work, Portfolio OS, and About fidelity` · 2026-08-23 21:59:45 -0400 |
| Worktree | **Dirty** — 11 unstaged files, 2 untracked paths, 0 staged. About route + About visual snapshots + `assemble-about.ts` + migrate payloads. |
| Package manager | pnpm `10.33.0` (`package.json#packageManager`); lockfile `pnpm-lock.yaml` |
| Node (declared / local) | `22.x` / `v22.21.1` |
| Atlas app path | `apps/atlas-web` (`@repo/atlas-web`); product docs `apps/atlas-docs` (Yarn, excluded from pnpm workspace) |
| Audit date/time | 2026-08-26, America/New_York |
| Limitations | Read-only; no install/snapshot update/CMS write/deploy. Dirty worktree. Live Strapi at configured local URL unreachable. Visual suite not executed this run. GitHub classic branch-protection API 404; live **ruleset** was readable. Secrets inspected by name only. |

## 3. Control matrix

| # | Domain | Status | Strongest evidence | Largest gap | Severity |
| --- | --- | --- | --- | --- | --- |
| 1 | Governance authority and discoverability | **NON-COMPLIANT** | Cursor `atlas-*` rules + Build Manifest are discoverable from `apps/atlas-web/CLAUDE.md` | Expected V1 file absent; conflicting/obsolete policy files | BLOCKER |
| 2 | Task intake and scope control | **NON-COMPLIANT** | Product rule lists non-goals; generic PR template exists | No Atlas task/issue template with V1 required fields; no operative risk class | HIGH |
| 3 | Human ownership and exceptions | **NON-COMPLIANT** | Live GitHub ruleset `CI Gate` is active | `required_approving_review_count: 0`; CODEOWNERS omits Atlas; no exception register | BLOCKER |
| 4 | Design-system contract | **PARTIAL** | Tokens in `globals.css`; Figma node map in M9D report; D/T/M Playwright projects | No 1024px width project; hardcoded hex; dual token sources | MEDIUM |
| 5 | Visual-regression governance | **NON-COMPLIANT** | Snapshots exist at 1440/768/390; `toHaveScreenshot` in e2e | CI job text excludes visual tests; `test:e2e:update` is ungated; dirty snapshots in worktree | HIGH |
| 6 | Content/editorial governance | **PARTIAL** | Committed fixtures; resilience copy unit + some e2e locks; Story-First in implementation | No standalone enforceable Story-First ADR; placeholders remain; article-404 e2e failed | MEDIUM |
| 7 | Strapi/frontend contract | **PARTIAL** | Hybrid architecture in `source.ts` + `content/index.ts`; fail-closed errors; site key `personal` | Fixture validator failed (8 issues); live CMS unverified; M8 assemblers unused for static routes | HIGH |
| 8 | Code and dependency governance | **PARTIAL** | CI `pnpm install --frozen-lockfile`; Atlas lint/typecheck scripts exist | Current lint **fails**; `cms-strapi` and `@repo/strapi-client` lint are no-ops | HIGH |
| 9 | Test and CI enforcement | **PARTIAL** | `CI Gate` required on `main`/`development`; Atlas functional e2e job exists | Visual excluded; `atlas-e2e` may skip; this SHA fails functional e2e; no format-check job | BLOCKER |
| 10 | Release and deployment governance | **NON-COMPLIANT** | Vercel project `nexus-atlas-web` exists; deploy SHA is recorded | Production target deployed from **feature branch via CLI**, not gated `main` | BLOCKER |
| 11 | Evidence package and auditability | **NON-COMPLIANT** | Milestone reports exist under `apps/atlas-docs/content/architecture/` | No G2–G4 evidence package, retention store, or named promotion record | HIGH |

## 4. Release-gate matrix

| V1 gate | Local command | CI job | Trigger / requiredness | Latest audit result | Evidence path | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| Lockfile install | `pnpm install --frozen-lockfile` (root) | `CI` / `detect` + `validate` + `atlas-e2e` | PR/push `main`,`development`; frozen lockfile | **Not re-run** (install forbidden). Deps already present. | `.github/workflows/ci.yml` L70–71, L125–126, L209–210 | **NOT VERIFIABLE** locally; **configured** in CI |
| Lint | `pnpm --filter @repo/atlas-web lint` | `validate` → `turbo run lint …` | Affected packages; `CI Gate` requires `validate` | **FAIL** — 2 errors (`react-hooks/set-state-in-effect`) | `apps/atlas-web/src/components/chrome/site-nav.tsx:112`; `src/lib/motion/use-reveal-phase.ts:40` | **FAIL** |
| Format policy | `pnpm format` is Prettier **`--write`** only | None | Not a CI job | **Not run** (mutating). No check-only script. | `package.json` L11 | **FAIL** (not an enforced gate) |
| Typecheck | `pnpm --filter @repo/atlas-web check-types` | `validate` → `turbo run check-types` | Affected | **PASS** (~28s) | `apps/atlas-web/package.json` `check-types` | **PASS** (this tree, fixture-irrelevant) |
| Unit / component tests | `pnpm --filter @repo/atlas-web test:unit`; `pnpm --filter @repo/strapi-client test` | `validate` `test` + `atlas-e2e` unit step | Affected | **PASS** — Atlas 20/20; client 21/21 | `apps/atlas-web/package.json` L15; `packages/strapi-client/package.json` L18 | **PASS** (subset: unit only) |
| Production build | `pnpm --filter @repo/atlas-web build` with `ATLAS_CONTENT_SOURCE=fixture` | `validate` → `turbo run build` | Affected; env not forced to fixture in validate job | **PASS** (~50s), 23 routes generated | Audit command env; Next listed `/`, `/work`, articles/docs SSG | **PASS** (fixture only) |
| Critical Playwright journeys | `pnpm --filter @repo/atlas-web test:e2e:functional` | `atlas-e2e` `test:e2e:functional` | Only if `has_work==true`; skipped allowed by `ci-gate` | **FAIL** — 35 failed, 6 skipped, 301 passed, 6.7m | Contact, docs search, reduced-motion, article 404, mobile menu | **FAIL** (fixture; not full `test:e2e`) |
| Route / link integrity | No dedicated script | None | — | Subset inside e2e (404s, nav). Article-404 journey failed. | `e2e/resilience.spec.ts`; `e2e/*` unknown-slug tests | **FAIL** / no dedicated gate |
| Visual regression | `pnpm --filter @repo/atlas-web test:e2e` (includes screenshots); update via `test:e2e:update` | **Excluded** — summary: “visual regression excluded — Linux baselines pending” | Not required | **Not executed** this audit | `.github/workflows/ci.yml` L242–250; `playwright.config.ts` L30–43 | **NOT VERIFIABLE**; **not a required CI gate** |
| CMS checks | `pnpm --filter cms-strapi migrate:atlas:validate` | None as a required named CMS job | — | Schema OK; **fixture validation FAIL** (8 issues). Live Strapi unreachable. | `apps/cms-strapi/scripts/migrate-atlas/src/validate.ts`; identity.json vs `work.ts` `selected.projects: []` | **FAIL** (fixtures); live **NOT VERIFIABLE** |
| Review / ownership | PR template questions | Ruleset requires PR + `CI Gate` status | `main`/`development` only; **0 approving reviews**; CODEOWNERS is iw-site-q2 only | Live ruleset read | `.github/rulesets/ci-gate.json`; GitHub ruleset `20425842` | **FAIL** vs V1 named human approval |
| Exact-commit deployment verification | None in repo | `deploy.yml` does **not** include atlas-web | Vercel Git + CLI | Latest production deploy SHA = HEAD, but `githubCommitRef` = **feature branch**, `source` = **cli** | Vercel `dpl_HYi1v3QzJaUmMBWaMZF8EVZdVfqd` | **FAIL** vs V1 (SHA exists, promotion path ungated) |

## 5. Findings

### GOV-B001 — V1 governance contract missing

- **Severity:** BLOCKER
- **Domain:** 1 Governance authority
- **Status:** NON-COMPLIANT
- **Requirement:** One versioned V1 contract at `docs/governance/atlas-ai-assisted-engineering-v1.md`, authoritative for humans and agents.
- **Evidence:** Path does not exist. `docs/governance/` is empty (glob 0 files). Repo-wide `rg` for `atlas-ai-assisted-engineering`, `G2–G4`, `task contract`, `risk class` returned no matches.
- **Risk:** Agents and reviewers cannot prove which V1 rules bind; milestone docs can claim “M0 Governance COMPLETE” without a V1 control surface.
- **Remediation outcome:** Add the versioned V1 document, point `CLAUDE.md` / Cursor rules at it, and retire or mark obsolete competitors.

### GOV-B002 — Production promotion bypasses GitHub gates and named human approval

- **Severity:** BLOCKER
- **Domain:** 3, 10 Release / ownership
- **Status:** NON-COMPLIANT
- **Requirement:** Production promotion requires named human approval and an exact commit that passed required gates on the protected branch.
- **Evidence:**
  - Live ruleset `CI Gate` (`id` 20425842): `required_approving_review_count: 0`, `require_code_owner_review: false`, applies only to `refs/heads/main` and `refs/heads/development`.
  - `.github/CODEOWNERS` lists only `apps/iw-site-q2/**`.
  - Vercel deployment `dpl_HYi1v3QzJaUmMBWaMZF8EVZdVfqd`: `target: production`, `source: cli`, `meta.actor: cursor-cli`, `githubCommitRef: feat/atlas-story-first-resilience-chrome`, `githubCommitSha: 1b7d8c4f…`.
  - `.github/workflows/deploy.yml` app choices are `iw-portal`, `iw-site-q2`, `cms-strapi` — not Atlas.
  - `.github/scripts/affected.mjs` `DEPLOYABLES` omits `@repo/atlas-web`.
- **Risk:** An agent or operator can ship Atlas “production” from a feature branch without PR review, CODEOWNERS, or `CI Gate`.
- **Remediation outcome:** Disable CLI/feature-branch production; require `main` + passing `CI Gate` + named human promotion; add Atlas CODEOWNERS and non-zero review count.

### GOV-B003 — Required quality gates fail on the SHA already deployed to Vercel production

- **Severity:** BLOCKER
- **Domain:** 8, 9 Test/CI
- **Status:** NON-COMPLIANT
- **Requirement:** Skipped/failing checks are not passes; release requires lint, critical Playwright, and related gates green on that commit.
- **Evidence:**
  - `pnpm --filter @repo/atlas-web lint` exit **1**: `site-nav.tsx:112`, `use-reveal-phase.ts:40` (committed files, not in the dirty About set).
  - `test:e2e:functional` exit **1**: 35 failed / 301 passed / 6 skipped (contact journeys, docs search, reduced-motion home, article-not-found copy, mobile menu).
- **Risk:** The deployed production artifact is not proven by the repository’s own gates.
- **Remediation outcome:** Make lint + functional e2e green on the release SHA **before** any production deploy; do not promote while failing.

### GOV-H001 — Visual regression is not a required release gate

- **Severity:** HIGH
- **Domain:** 5 Visual-regression
- **Status:** NON-COMPLIANT
- **Requirement:** Visual regression is a required V1 gate; baseline updates need human approval and before/candidate/diff evidence.
- **Evidence:** `ci.yml` L242–250: functional Playwright only; “visual regression excluded — Linux baselines pending”. Linux PNGs already exist under `apps/atlas-web/e2e/*-snapshots/*-linux.png`. `package.json` `test:e2e:update` updates snapshots with no approval workflow. Worktree already contains modified About `*-win32.png` snapshots. Threshold `maxDiffPixelRatio: 0.02` in e2e specs. `ci-gate` treats `atlas-e2e` **skipped** as success (`ci.yml` L271–274).
- **Risk:** Visual drift and self-approved baselines can merge or deploy without independent review; CI comment is stale relative to linux snapshots.
- **Remediation outcome:** Required CI visual job that cannot update baselines; separate human-approved baseline PR; retain artifacts.

### GOV-H002 — No operative task contract or risk classification

- **Severity:** HIGH
- **Domain:** 2 Task intake
- **Status:** NON-COMPLIANT
- **Requirement:** Durable templates requiring objective, authorized scope, out-of-scope, authority refs, acceptance, risk, verification, subsystems, stop conditions, reviewer. Agents must not start material work without them.
- **Evidence:** No `.github/ISSUE_TEMPLATE`. PR template (`.github/pull_request_template.md`) is four free-text governance prompts. IntraWeb `apps/ai-ops/.../TASK_TEMPLATE.md` is not Atlas V1 (no G2–G4, no stop conditions). Cursor `atlas-*` rules have `alwaysApply: false` and contain **no** authority-conflict stop conditions (`rg` in `.cursor/rules` for stop/ambiguity/authority conflict: none).
- **Risk:** An agent can implement on this branch (and CLI-deploy) without a recorded contract.
- **Remediation outcome:** Atlas issue/PR/agent templates with V1 fields; hook or checklist that blocks implementation without them.

### GOV-H003 — CMS fixture contract drifted; live CMS unverified

- **Severity:** HIGH
- **Domain:** 7 Strapi/frontend
- **Status:** PARTIAL
- **Requirement:** Schema, fixtures, queries, types, renderers, tests aligned; fixture vs live verified separately; migrations enforced.
- **Evidence:**
  - `migrate:atlas:validate` exit 1: missing slugs `shared-strapi-cms`, `intraweb-automation`, `vehicle-maintenance`; Home selected count 3 vs Work selected 0.
  - Cause in code: `work.ts` L184–188 `selected.projects: []` after Story-First `gallery`; validator still reads `selected.projects` (`validate.ts` L51–75); expected list in `expected/identity.json`.
  - M8 report (`m8-strapi-integration.mdx`) still says Home/Work/About/Contact are “Wired” to CMS; `v1-content-architecture.mdx` and `content/index.ts` L41–80 always return fixtures for those routes. Assemblers `assemble-home.ts` etc. remain unused on the live load path.
  - No `apps/cms-strapi` database/migrations tree. `cms-strapi` `lint`/`check-types` are `node -e "process.exit(0)"`.
  - Local Strapi probe to `http://localhost:1337` timed out. No live-CMS Playwright job.
- **Risk:** Launch can claim CMS readiness from M8 docs while fixtures, validator, and runtime contracts disagree; live Articles/Docs fail-closed path is unproven.
- **Remediation outcome:** Align identity/validator with Story-First fixtures **or** restore selected lists; re-lock M8 vs v1 hybrid; add required live-CMS checks against a non-prod instance; stop no-op lint on schema packages.

### GOV-H004 — Conflicting and obsolete policy files

- **Severity:** HIGH
- **Domain:** 1 Authority
- **Status:** NON-COMPLIANT
- **Requirement:** Do not silently choose among conflicting policies; Cursor is implementation agent, not product/design/CMS/release authority.
- **Evidence:**
  - `apps/atlas-docs/CLAUDE.md` still describes a **Mantine + Nextra template** and Yarn-only commands — contradicts `apps/atlas-web/CLAUDE.md` and Build Manifest.
  - `atlas-frontend.mdc` “Fixture First / until mappers ship” vs shipped M8 mappers vs v1 hybrid “static never Strapi”.
  - `atlas-definition-of-done.mdc` / `atlas-testing.mdc` require visual D/T/M in CI; `ci.yml` excludes visual.
  - Case-study fixture copy claims visual regression “gates every merge” (`portfolio-os.ts` ~L178) — false given CI.
  - Build Manifest table: **M0 Governance COMPLETE** while V1 file is absent.
- **Risk:** Agents follow the nearest file and ship against a superseded contract.
- **Remediation outcome:** Single authority map; obsolete CLAUDE.md replaced; DoD vs CI reconciled; editorial claims that overstate gates removed or proven.

### GOV-H005 — No exception mechanism; no G2–G4 evidence retention

- **Severity:** HIGH
- **Domain:** 3, 11
- **Status:** NON-COMPLIANT
- **Requirement:** Exceptions with rule, reason, risk, compensating control, owner, expiration, approval. G2–G4 changes retain a commit-linked evidence package.
- **Evidence:** `atlas-documentation.mdc` names a “Decision log” but no decision-log file exists under `apps/atlas-docs`. No waiver/exception register. No evidence-package path or CI artifact retention for visual diffs / CMS mode / approvals. Milestone MDX reports are narrative, not commit-linked gate packets.
- **Risk:** Baseline and release self-approval cannot be reconstructed; exceptions are informal.
- **Remediation outcome:** Exception register + evidence package template stored with the SHA; CI uploads non-secret artifacts.

### GOV-M001 — Canonical viewports omit 1024px width and breakpoint-boundary proof

- **Severity:** MEDIUM
- **Domain:** 4 Design-system
- **Status:** PARTIAL
- **Requirement:** Desktop, tablet, mobile, **1024px width**, and widths around changed breakpoints.
- **Evidence:** `playwright.config.ts` L32–42: 1440 / 768 / 390 only. `globals.css` breakpoints `@media (min-width: 768px)` and `1440px`; `--breakpoint-tablet/desktop` only. Atlas `rg` for `1024` hits tablet **height** 1024, not width.
- **Risk:** Layout defects at the common laptop/small-desktop width are ungoverned.
- **Remediation outcome:** Centralize viewport constants (including 1024 and ±1 around token breakpoints) and consume them in Playwright and review.

### GOV-M002 — Ungoverned hard-coded visual values and duplicate token sources

- **Severity:** MEDIUM
- **Domain:** 4
- **Status:** PARTIAL
- **Requirement:** Implementation traces to approved tokens; no unexplained duplicate sources.
- **Evidence:** Token hex in `globals.css` L3–23; duplicate motion numbers in `src/lib/motion/tokens.ts`. Hard-coded `#2a3a52`, `#24344d`, `#c8beaa` in `case-hero.tsx`, `home-hero.tsx`, `case-contact.tsx`, `about-contact.tsx`.
- **Risk:** Drift from Figma tokens without a review signal.
- **Remediation outcome:** Tokenize remaining colors; single motion source consumed by CSS and JS.

### GOV-M003 — Format, no-op lint, Node version, and affected-skip holes

- **Severity:** MEDIUM
- **Domain:** 8, 9
- **Status:** PARTIAL
- **Requirement:** Lint/format policy enforced; skipped subset checks are not passes.
- **Evidence:** Root `format` is write-only. `packages/strapi-client` `lint` is `process.exit(0)`. `cms-strapi` same. Vercel project `nexus-atlas-web` `nodeVersion: 24.x` vs repo `engines.node: 22.x`. `atlas-e2e` skipped when `has_work != true`, and skip satisfies `CI Gate`. Schema-only `cms-strapi` changes need not run Atlas e2e (`atlas-web` depends on `@repo/strapi-client`, not `cms-strapi`).
- **Risk:** CMS/schema or format breakage can look green.
- **Remediation outcome:** Real lint on client/CMS; format `--check` in CI; pin Vercel Node 22; fail-closed Atlas+CMS pairing when schemas change.

### GOV-L001 — Atlas agent rules are glob-gated; docs app is outside the pnpm graph

- **Severity:** LOW
- **Domain:** 1, 8
- **Status:** PARTIAL
- **Requirement:** Controls easy for humans and agents to find; repository boundaries enforced.
- **Evidence:** All `atlas-*.mdc` set `alwaysApply: false`. `pnpm-workspace.yaml` excludes `apps/atlas-docs`. Root `docs/architecture/deployment-runbook.md` still omits Atlas from “production apps only” build example (L58) and is stale on typecheck ownership (L68).
- **Risk:** Agents in a non-matching file context miss Atlas rules; docs site is not in affected CI.
- **Remediation outcome:** Always-apply a short Atlas authority pointer; document docs-app isolation; refresh the runbook.

## 6. Atlas contract map

| Layer | Path | Notes |
| --- | --- | --- |
| V1 governance contract | `docs/governance/atlas-ai-assisted-engineering-v1.md` | **MISSING** |
| Product / decision records | `apps/atlas-docs/content/architecture/build-manifest.mdx`; `v1-content-architecture.mdx`; `architecture-freeze.mdx`; `m8-*.mdx`; `m9d-art-direction.mdx` | Present; no dedicated decision log |
| Figma / design references | Build Manifest frozen pages; M9D node IDs; file key `6r1KqLmwiB8TUXjyedezom` in `atlas-web/CLAUDE.md` | Present as docs, not machine-checked |
| Tokens | `apps/atlas-web/src/styles/globals.css`; `src/lib/motion/tokens.ts` | Dual sources |
| CMS schema | `apps/cms-strapi/src/api/**/schema.json`; `src/components/**` | Present |
| Migrations | `apps/cms-strapi/scripts/migrate-atlas/**`; `scripts/migrate/**` | Scripted upsert/validate; **no SQL migration tree** |
| Fixtures | `apps/atlas-web/src/content/**` | Present; validator out of date |
| Query / population | `packages/strapi-client/**`; `apps/atlas-web/src/lib/strapi/client.ts` | Present |
| Normalization / assemblers | `apps/atlas-web/src/lib/strapi/assemble-*.ts` | Articles/docs used; home/work/about/contact assemblers **not** on v1 load path |
| TypeScript types | `apps/atlas-web/src/content/*.ts`; `packages/strapi-client/src` | Present |
| Renderers | `apps/atlas-web/src/app/**`; `components/{chrome,editorial,sections}` | Present |
| Tests | `apps/atlas-web/src/**/*.test.ts`; `e2e/*.spec.ts` | Unit pass; functional e2e fail |
| Visual baselines | `apps/atlas-web/e2e/*-snapshots/` (win32 + linux) | Present; CI unused |
| CI | `.github/workflows/ci.yml`; `.github/scripts/affected.mjs`; `.github/rulesets/ci-gate.json` | Present |
| Deployment | `apps/atlas-web/vercel.json`; Vercel `nexus-atlas-web` | Present; CLI production used |
| Release evidence | Milestone MDX only | **MISSING** V1 package |
| Exception / waiver records | — | **MISSING** |
| Issue/task templates | — | **MISSING** (generic PR template only) |
| CODEOWNERS (Atlas) | — | **MISSING** |

## 7. Commands executed

| Command | CWD | Env / data mode (values redacted) | Exit | Duration | Result | Full gate? |
| --- | --- | --- | --- | --- | --- | --- |
| `git rev-parse` / `status` / `log` / `remote` | repo root | n/a | 0 | ~10s | Branch, SHA, dirty 13 porcelain lines | Identity only |
| `node -v`; `pnpm -v` | repo root | n/a | 0 | ~10s | v22.21.1 / 10.33.0; node_modules present | — |
| Env key listing (no values) | `apps/atlas-web` | `.env.local` keys: `ATLAS_CONTENT_SOURCE`, `STRAPI_URL`, `STRAPI_API_TOKEN`, `STRAPI_PREVIEW_SECRET` | 0 | ~8s | Local CMS vars named | — |
| `pnpm --filter @repo/atlas-web lint` | repo root | default | **1** | ~98s | 2 errors, 7 warnings | Yes (Atlas lint) |
| `pnpm --filter @repo/atlas-web check-types` | repo root | default | 0 | ~28s | Clean `tsc --noEmit` | Yes (Atlas types) |
| `pnpm --filter @repo/atlas-web test:unit` | repo root | default | 0 | ~23s | 20 pass | Unit subset |
| `pnpm --filter @repo/strapi-client test` | repo root | mocked fetch | 0 | ~11s | 21 pass | Client unit |
| `pnpm --filter cms-strapi migrate:atlas:validate` | repo root | Read `STRAPI_URL` (localhost); token present, unused for writes | **1** | ~11s | Schema OK; 8 fixture errors | CMS fixture subset |
| HTTP GET `http://localhost:1337` | n/a | 3s timeout | n/a | ~11s | Unreachable | Live CMS |
| `ATLAS_CONTENT_SOURCE=fixture pnpm --filter @repo/atlas-web build` | repo root | Fixture override; Next still noted `.env.local` present | 0 | ~50s | 23 routes | Fixture build only |
| `ATLAS_CONTENT_SOURCE=fixture CONTACT_INSECURE_SKIP_SEND=true pnpm --filter @repo/atlas-web test:e2e:functional` | repo root | Playwright webServer also forces fixture + skip-send | **1** | 6.7m | 301 passed, 35 failed, 6 skipped | Functional subset, not visual |
| `gh api .../rulesets/20425842` | n/a | read-only | 0 | ~6s | Active ruleset | External |
| `gh api .../branches/main/protection` | n/a | read-only | 1 (404) | — | Classic protection unused | External |
| Visual `test:e2e` (with screenshots) | — | — | — | — | **Not run** | — |
| `pnpm format` | — | — | — | — | **Not run** (mutates) | — |
| Live-CMS e2e / `--write` migrate | — | — | — | — | **Not run** (service down / mutating) | — |

Failed functional clusters: contact validation/submit/failure/honeypot (all 3 viewports); docs search/filter; desktop Ctrl+K search; reduced-motion home; article-not-found heading; mobile menu/nav.

## 8. Current release blockers

1. **GOV-B001** — V1 file missing. *Close with:* committed `docs/governance/atlas-ai-assisted-engineering-v1.md` linked from agent entry points, conflicts resolved.
2. **GOV-B002** — Production deploy from feature branch via CLI with zero required reviewers. *Close with:* proof that production aliases only move after `main` + `CI Gate` + named human approval; no CLI production.
3. **GOV-B003** — Lint and functional Playwright fail on the SHA already on Vercel production. *Close with:* green lint + `test:e2e:functional` (and the other required gates) on that SHA, then a new gated production deploy.

No other blocker was proven beyond these three. Visual/CMS/live gaps are **HIGH**, not additional blockers, because V1 already forbids treating them as passes — they keep release **BLOCKED** until included and green, but the three items above are sufficient to stop a governed production claim.

## 9. Prioritized remediation plan

Do not implement this plan as part of this audit.

### Policy / control wiring

1. **Publish V1 and an authority map** — Owner: product + engineering lead. Risk: G4. Depends on: none. Evidence: file exists; `CLAUDE.md` / Cursor rules point to it; `atlas-docs/CLAUDE.md` no longer describes a Mantine starter. Human judgment: **yes**.
2. **Atlas task/PR templates + stop conditions** — Owner: engineering lead. Risk: G2. Depends on 1. Evidence: template fields match V1; agent rules `alwaysApply` a pointer. Human: **yes**.
3. **CODEOWNERS + required reviews + exception register** — Owner: repo admin. Risk: G3. Depends on 1. Evidence: Atlas paths owned; ruleset `required_approving_review_count >= 1`; exceptions have owner/expiry. Human: **yes**.

### CI enforcement

4. **Fail `CI Gate` on Atlas lint/e2e; stop treating `atlas-e2e` skip as success when Atlas/CMS files change** — Owner: platform. Risk: G3. Depends on 3. Evidence: workflow cannot skip visual/CMS once those jobs exist; schema changes pull Atlas checks. Human: no (wiring), yes (what is required).
5. **Add format `--check`; replace no-op package lint** — Owner: platform. Risk: G2. Depends on 4. Evidence: CI logs. Human: no.

### Design / visual governance

6. **Required visual CI (compare-only) + separate baseline PR** — Owner: design + frontend. Risk: G3. Depends on 4. Evidence: job artifacts before/candidate/diff; `test:e2e:update` not used in CI. Human: **yes** for baseline approval.
7. **Viewport contract including 1024 and token-boundary widths** — Owner: design. Risk: G2. Depends on 6. Evidence: shared constants consumed by Playwright. Human: **yes**.

### CMS contract governance

8. **Reconcile Story-First fixtures with `identity.json` / validator; relock M8 vs v1 hybrid** — Owner: CMS + frontend. Risk: G3. Depends on 1. Evidence: `migrate:atlas:validate` exit 0; unused assemblers documented or removed from “wired” claims. Human: **yes**.
9. **Live-CMS fixture-separate job** against non-prod Strapi — Owner: CMS. Risk: G4. Depends on 8 + reachable staging CMS. Evidence: fail-closed Articles/Docs tests. Human: **yes** (env).

### Release evidence

10. **Bind Vercel production to `main` + `CI Gate`; disable CLI production; pin Node 22** — Owner: release owner. Risk: G4. Depends on 3–4. Evidence: next production `meta.githubCommitRef=main`, `source=git` or promotion UI with named approver; Node 22. Human: **yes**.
11. **G2–G4 evidence package per material change** — Owner: implementing engineer + reviewer. Risk: G3. Depends on 1–2. Evidence: SHA-linked packet with gates, CMS mode, visual proof, exception list, promotion decision. Human: **yes**.

Incremental remediation is sufficient; a rewrite is not indicated.

## 10. Evidence appendix

**V1 path:** expected `docs/governance/atlas-ai-assisted-engineering-v1.md` — not found.

**Agent entry (Atlas):** `apps/atlas-web/CLAUDE.md` points at `.cursor/rules/atlas-*.mdc` and Build Manifest; does not mention V1.

**CI visual exclusion (`ci.yml`):**

```242:250:.github/workflows/ci.yml
      - name: Atlas E2E summary
        if: always()
        run: |
          {
            echo "## Atlas E2E"
            echo ""
            echo "- Content source: \`fixture\` (explicit)"
            echo "- Scope: unit tests + functional Playwright (visual regression excluded — Linux baselines pending)"
          } >> "$GITHUB_STEP_SUMMARY"
```

**CI Gate allows skipped Atlas e2e:**

```271:274:.github/workflows/ci.yml
          if [ "${{ needs.atlas-e2e.result }}" != "success" ] && [ "${{ needs.atlas-e2e.result }}" != "skipped" ]; then
            echo "Atlas E2E job failed"
            exit 1
          fi
```

**Live GitHub ruleset (redacted to structure):** enforcement `active`; refs `main` + `development`; `required_approving_review_count: 0`; required check context `CI Gate`.

**Hybrid CMS (operative):** `apps/atlas-web/src/lib/strapi/source.ts` `usesStrapiFor("static")` always false; `content/index.ts` static getters return fixtures only.

**Vercel production deploy (structure only):** project `nexus-atlas-web` (`prj_hjC2fbNG8J3Ld8f2ao5AqlAENXWd`); deployment `dpl_HYi1v3QzJaUmMBWaMZF8EVZdVfqd`; `target=production`; `source=cli`; `actor=cursor-cli`; ref `feat/atlas-story-first-resilience-chrome`; SHA `1b7d8c4f3140758bc62fcf05e248524ec5d3c633`; domains `*.vercel.app` only (not `johnschibelli.dev`); Node `24.x`; SSO protection on non-custom domains.

**Playwright viewports:** 1440×900, 768×1024, 390×844 — `apps/atlas-web/playwright.config.ts`.

**Dirty worktree (Atlas About):** modified `about.spec.ts` and four `about-*-win32.png` snapshots; untracked `public/images/brand/about/` and `about-working-notes.tsx`.

**INFERENCE (labeled):** Article-not-found e2e failure is consistent with App Router SSG/`generateStaticParams` serving a different not-found tree than `app/articles/not-found.tsx` for unknown slugs — facts are the three-viewport timeout on heading `Article not found.`; root cause was not patched.
