# Portal — user guide (clients)

For authenticated **client** users whose Clerk account is linked to a `clients` row.

## Sign in

1. Open the dashboard host and complete Clerk sign-in.
2. Post-auth routing sends you into the portal shell.
3. If you see “portal access is being set up,” your user is authenticated but not linked as a client owner yet — contact IntraWeb staff. Invited members without an owner row are **not** fully supported yet.

## Navigate

| Area | Use |
| --- | --- |
| Dashboard | Snapshot of progress, billing, messages, notifications |
| Progress | Milestones; approve when prompted |
| Documents | Upload, download, sign |
| Messages | Project thread with staff |
| Billing | Invoices, checkout, payment methods, maintenance packages when offered |
| Change orders | Request contractual scope changes; cancel when allowed |
| Notifications | Merged activity feed |
| Settings | Account metadata; notification preferences |
| Help | FAQ and contact |
| Scope | Plan summaries (not a live signed SOW viewer) |

## Approvals and automations

- Approving milestones / proposals updates portal records and may notify HubSpot/n8n.
- You do not operate n8n directly; outcomes appear as documents, invoices, or messages.

## Multi-project

If you have multiple projects, use the project switcher. **Known limitation:** some write actions still target the oldest project rather than the selected one — prefer one active project or confirm with staff if something lands on the wrong project.

## Failures

- Use page error “Try again” when a boundary appears.
- Billing issues: check invoice status; staff can see Stripe/HubSpot references in admin.
- Do not share magic links or session cookies.
