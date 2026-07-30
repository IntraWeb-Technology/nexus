# Automations — workflow catalog

Statuses follow `docs/audit/README.md`. Full notes: `docs/audit/n8n-workflow-inventory.md`.

## Lead generation

| Workflow | Status | Trigger |
| --- | --- | --- |
| Kickoff - Booked Webhook | Planned | Webhook |
| AI Voice Lead Qualification | Partially Implemented | Webhook |
| Cal.com Kickoff Booking Handler | Implemented | Webhook |
| Lead Sourcing Machine | Partially Implemented | Schedule |
| Website Form Lead Intake | Implemented | Webhook |
| Client Intake Brief (Real-Time) | Implemented | HubSpot trigger |

## Outreach

| Workflow | Status | Trigger |
| --- | --- | --- |
| ElevenLabs Post-Call Handler | Partially Implemented | Webhook |
| Outbound Lead Outreach Sequence | Implemented | Webhook |

## Sales

| Workflow | Status | Trigger |
| --- | --- | --- |
| Contract Generation | Implemented | Webhook |
| Invoice and Payment Collection | Implemented | Webhook |
| HubSpot invoice → portal add_invoice | Partially Implemented | Webhook |
| Stripe subscription → HubSpot deal sync | Unverified | Webhook |
| Pre-Call Diagnostic Brief | Partially Implemented | Webhook |
| Proposal and Contract Delivery | Partially Implemented | Webhook |
| Qualified to Buy → Portal + Clerk | Partially Implemented | Webhook |
| Stripe Payment → HubSpot Paid Sync | Implemented | Webhook |

## Onboarding / client success / content / reporting / ops

| Workflow | Status |
| --- | --- |
| Client Onboarding Docs Generator | Implemented |
| Client Onboarding Logistics | Partially Implemented |
| Client Health Monitoring | Implemented |
| Client Weekly Updates | Implemented |
| Data Deletion Handler | Partially Implemented |
| Email Unsubscribe Handler | Implemented |
| Referral and Reactivation Engine | Partially Implemented |
| LinkedIn Content Pipeline | Implemented |
| Internal Reporting Dashboard | Implemented |
| Google Chat Command Center | Implemented |
| Automated workflow backup | Implemented |
| OS Owners Manual Generator | Implemented |

## Representative deep docs

- [Qualified to Buy → Portal + Clerk](./workflows/qualified-to-buy-portal-clerk.md)
- [Proposal and Contract Delivery](./workflows/proposal-and-contract-delivery.md)
- [Website Form Lead Intake](./workflows/website-form-lead-intake.md)
- [Data Deletion Handler](./workflows/data-deletion-handler.md)
