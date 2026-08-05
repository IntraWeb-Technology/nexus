# n8n workflow inventory

**Package:** `packages/n8n-workflows` (`@repo/n8n-workflows`)  
**Operator docs:** `RUNBOOK.md`, `STAGES.md`  
**Synced snapshot:** `_synced-from-n8n/` (99 exports) — discovery only; curated folders are the package source of truth  
**Evidence date:** 2026-07-30  

Status means structural completeness in checked-in JSON, **not** live production verification.

Sample/test payload JSON files are excluded from the catalog.

---

## Category summary

| Folder | Curated workflows (excl. samples) | Dominant status |
| --- | --- | --- |
| `01_lead-generation` | 6 | Mix Implemented / Partial / Planned |
| `02_outreach` | 2 | Partial / Implemented |
| `03_sales` | 8 | Mix; portal invoice path Partial (auth defect) |
| `04_onboarding` | 2 | Implemented / Partial |
| `05_client-success` | 5 | Mix |
| `06_content` | 1 | Implemented |
| `07_reporting` | 1 | Implemented |
| `07_social` | 0 | Empty |
| `08_command-center` | 1 | Implemented |
| `09_documentation` | 2 | Implemented |
| `_subworkflows` | 8 | Mostly Implemented |

---

## Catalog by category

### Lead generation (`01_lead-generation`)

| Name | ID | Trigger | Status | Notes |
| --- | --- | --- | --- | --- |
| Kickoff - Booked Webhook | *(none)* | Webhook `kickoff-booked` | Planned | Downstream HubSpot/logging still placeholder |
| SYS 01 - AI Voice Lead Qualification | `dDeJ0UOrGnkXGeix` | Webhook | Partially Implemented | Fallback host `your-n8n-domain.com` |
| SYS 01 - Cal.com Kickoff Booking Handler | `jZSXHKgoMIQErTJ1` | Webhook | Implemented | HubSpot credential |
| SYS 01 - Lead Sourcing Machine | `RJngRI1L2LcmFmZ0` | Schedule (Monday) | Partially Implemented | Placeholder n8n URL; Maps/Hunter enrichment |
| SYS 01 - Website Form Lead Intake | `JzghCkfPxT5CV1iT` | Webhook | Implemented | HubSpot + Supabase OS; Postgres retries |
| SYS 01.5 - Client Intake Brief (Real-Time) | `mVlQSfO4pb5lomdf` | HubSpot contact trigger | Implemented | Local filesystem write may be fragile |

### Outreach (`02_outreach`)

| Name | ID | Trigger | Status | Notes |
| --- | --- | --- | --- | --- |
| SYS 02 - ElevenLabs Post-Call Handler | `zJWCaaXQ0HbwYiAO` | Webhook | Partially Implemented | **Committed Google Chat webhook secret in JSON** |
| SYS 02 - Outbound Lead Outreach Sequence | `jDbLNf6Q1mIaTlGy` | Webhook | Implemented | Long waits (14-day sequence) |

### Sales (`03_sales`)

| Name | ID | Trigger | Status | Notes |
| --- | --- | --- | --- | --- |
| SYS 03 - Contract Generation | `5gXQdYfFgl0JStaA` | Webhook | Implemented | Claude → PDF → Drive/Supabase |
| SYS 03 - Invoice and Payment Collection | `8ZTesLyN6hpZojPh` | Webhook | Implemented | Timed reminders |
| Portal - HubSpot invoice → add_invoice | `isYyC3wLTBiGPhJS` | Webhook | Partially Implemented | **`x-intrawebtech-secret` misconfigured (URL instead of secret)** |
| Portal - Stripe subscription → HubSpot deal sync | *(none)* | Webhook | Unverified | Portal emits path; export lacks stable ID/`active` |
| SYS 03 - Pre-Call Diagnostic Brief | `mH67fjS4eC9amV4n` | Webhook | Partially Implemented | Typeform placeholder; Chat secret committed |
| SYS 03 - Proposal and Contract Delivery | `1aX9pLXOuVelq3sK` | Webhook | Partially Implemented | Portal `attach_project_document`; curated≠synced drift |
| SYS 03 - Qualified to Buy → Portal + Clerk | `jERY0wN0aZ5kpOAR` | Webhook | Partially Implemented | `provision_client` / `add_invoice`; drift vs synced |
| SYS 03 - Stripe Payment → HubSpot Paid Sync | `i1Fe1DxmomgmKK7k` | Webhook | Implemented | Stripe via env |

### Onboarding (`04_onboarding`)

| Name | ID | Trigger | Status | Notes |
| --- | --- | --- | --- | --- |
| SYS 04 - Client Onboarding Docs Generator | `QjW7q9bT5wqCjynz` | Subworkflow | Implemented | |
| SYS 04 - Client Onboarding Logistics | `Nsu2htyjU8ZTidLN` | Webhook | Partially Implemented | Live emails contain `PLACEHOLDER_CREDENTIALS_FORM` |

### Client success (`05_client-success`)

| Name | ID | Trigger | Status | Notes |
| --- | --- | --- | --- | --- |
| SYS 05 - Client Health Monitoring | `oMCQFip422ufnvMN` | Schedule | Implemented | |
| SYS 05 - Client Weekly Updates | `K7ndggofjscFDRHN` | Schedule | Implemented | AI updates |
| SYS 05 - Data Deletion Handler | *(empty ID)* | Webhook | Partially Implemented | Calls portal privacy API; hard-coded host |
| SYS 05 - Email Unsubscribe Handler | `BKRuq4jpMBp6Rhvj` | Webhook | Implemented | Not found in synced snapshot by ID |
| SYS 05 - Referral and Reactivation Engine | `3JWOGfRAtb7a9plr` | Webhook + schedule | Partially Implemented | Curated≠synced drift |

### Content / reporting / command / docs

| Name | ID | Status |
| --- | --- | --- |
| SYS 06 - LinkedIn Content Pipeline | `2O0odRL5azZZLv5N` | Implemented |
| SYS 07 - Internal Reporting Dashboard | `EZe0M0WcHC6bOsdg` | Implemented |
| SYS 08 - Google Chat Command Center | `5zqAo5so5iSSCnXY` | Implemented |
| Automated workflow backup - Google Drive | `Lj9OHbsMMK6m5c6i` | Implemented |
| SYS 09 - OS Owners Manual Generator | `BAwRpt7tMRXm6YcZ` | Implemented |

### Subworkflows (`_subworkflows`)

| Name | ID | Status |
| --- | --- | --- |
| SW - Call Claude API | `4PPD67ZzEON8Rxxe` | Implemented |
| SW - Create HubSpot Deal | `r3XBl1iiKYzSOFWF` | Implemented |
| SW - Create or Update HubSpot Contact | `HbPxMMcf5tGERxEr` | Partially Implemented |
| SW - Generate PDF from HTML | `hxsCltRP81r5gLtm` | Implemented |
| SW - Log to Automations Log Sheet | `1qQFLOSHZsS9JPKP` | Implemented |
| SW - Send Email via Resend | `FF6VOLCcRxI4uNYD` | Implemented |
| SW - Send Google Chat Alert | `PGf6jPoWtxSPlr0h` | Implemented |
| SW - Send SMS | `VzxtOFmmGEitVEQk` | Implemented |

---

## Quality and risk findings

1. **Critical — secrets in workflow JSON:** Google Chat webhook keys/tokens in ElevenLabs Post-Call and Pre-Call Diagnostic Brief. Rotate; move to credentials/config.
2. **Critical — portal add-invoice auth:** shared-secret header value is an n8n URL, not `WEBHOOK_SECRET`.
3. **High — missing workflow IDs:** Kickoff Booked, Stripe→HubSpot subscription sync, Data Deletion — blocks ID-based sync/push.
4. **High — portal outbound orphans:** portal emits `portal-message-received`, `portal-login`, `portal-document-request`, `portal-invoice-paid`, `portal-stripe-catalog-payment`, `portal-change-order` with **no curated receivers** in this package.
5. **High — curated vs synced drift:** Proposal/Contract Delivery, Qualified to Buy, Referral engine — blind sync can destroy curated nodes.
6. **High — placeholders in customer paths:** Typeform URL, credentials form, n8n host placeholders.
7. **Medium — weak error/retry posture** on many parent workflows; `continueRegularOutput` can mask failures.
8. **Medium — inconsistent credential names** and hard-coded Drive folder / production host values.
9. **Medium — long Wait nodes** complicate upgrades (outreach, invoices, onboarding, referral).

---

## Recommended doc IA (implemented under `docs/automations/`)

See Milestone 4 documentation set:

- overview, architecture, setup, credentials, environment  
- workflow-catalog + per-workflow pages  
- monitoring, error-handling, security, troubleshooting  
