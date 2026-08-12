# Portal — troubleshooting

| Symptom | Check |
| --- | --- |
| Infinite Clerk redirect | Satellite domains, `CLERK_*` env, proxy matcher |
| Authenticated but no portal data | `clients.clerk_user_id` link; provision workflow; member vs owner gap |
| Any user becomes staff admin | Staff email allowlist env empty — set immediately |
| n8n 401 | `WEBHOOK_SECRET` vs workflow header |
| n8n 404/HTML login on internal API | Proxy public routes vs `/api/internal/privacy` or social-ops |
| Wrong project for message/upload | Multi-project write bug — oldest project selected |
| Stripe webhook ignored | Endpoint URL, webhook secret, `integration_events` |
| Empty admin tables | Service role / DB connectivity; distinguish empty vs errored queries |
| Social Ops cron no-op | Migration 019 applied? env secrets? route reachable? |
| Types/build fail | `pnpm --filter @repo/iw-portal check-types` |

Also: `apps/iw-portal/README.md`, `docs/architecture/incident-response.md`, `docs/automations/troubleshooting.md`.
