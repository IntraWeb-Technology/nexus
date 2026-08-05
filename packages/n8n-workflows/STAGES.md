# HubSpot deal stages (CONFIG + marketing intake)

## Marketing → SYS 01 (first touch)

- **CONFIG — Global Settings** (`_config/CONFIG — Global Settings.json`): set **`hubspot.dealStageIds.discoveryCallRequested`** to the HubSpot **internal** stage id used when n8n should create a deal at “first touch” (often a custom numeric id, not a display label).
- The marketing site sends **`appointmentscheduled`** by default (valid on HubSpot’s **default** sales pipeline). For **custom** pipelines, set deployment env **`N8N_CONTACT_DEAL_STAGE`** on `iw-site-q2` to that pipeline’s numeric stage id so new deals land in the correct column.
- **`qualifiedtobuy`** is reserved for the **sales gate**: when the deal enters Qualified, **SYS 00** routes to **SYS 03** (`hubspot-deal-qualified-portal`) for portal `provision_client` + Clerk.

## SYS 00 → SYS 03 (Qualified union)

- **Qualified to buy** routing uses the union of:
  - HubSpot builtin **`qualifiedtobuy`**
  - CONFIG **`hubspot.dealStageIds.qualifiedToBuy`** (comma-separated ids)
  - CONFIG **`hubspot.dealStageIds.leadQualified`** (unioned for pipelines that map “qualified” differently)

Keep these ids aligned with your live HubSpot pipeline so stage changes actually hit SYS 03.

## Google Drive nodes (OAuth2)

- **Google Drive** nodes (`n8n-nodes-base.googleDrive`) must use credential type **`googleDriveOAuth2Api`** (OAuth2), not `googleApi` or a Sheets-only credential.
- Checked-in workflows align Drive uploads/folder creation with **SYS 03 — Proposal and Contract Delivery** (`Google Drive account 2` / id `oPioaF4sFaVsK13H` on your n8n instance). After import, if ids differ, reconnect **once** in the UI and re-export—or duplicate the credential name/id across environments via n8n’s credential list.
