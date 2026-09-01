# Atlas governance exceptions register

**Authority:** [`atlas-ai-assisted-engineering-v1.md`](./atlas-ai-assisted-engineering-v1.md) §14

Exceptions must be explicit, narrow, time-bounded, owned, and visible. An implementing agent may not approve its own exception.

## Required fields (per exception)

| Field | Description |
| --- | --- |
| **Exception ID** | Stable identifier (e.g. `EXC-001`) |
| **Rule waived** | Exact V1 rule, gate, or control being waived |
| **Reason** | Why the exception is needed (deadline pressure alone is insufficient) |
| **Risk** | Resulting risk if the control remains waived |
| **Compensating control** | What mitigates the risk during the exception |
| **Owner** | Named person accountable for removal or renewal |
| **Approval** | Named approver and date |
| **Expiration** | Date or event when the exception ends |
| **Removal condition** | What must be true to close the exception |
| **Status** | `active`, `expired`, or `removed` |

## Active exceptions

_None recorded._

## Closed exceptions

_None recorded._
