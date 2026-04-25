console.error(
  [
    '[DEPRECATED] apps/iw-site/scripts/sync-workflows-to-n8n.mjs has been retired.',
    'Reason: it matched by workflow name and could create duplicate workflows.',
    '',
    'Use canonical package scripts instead:',
    '  - Pull full remote dump: pnpm --filter @repo/n8n-workflows pull:n8n',
    '  - Sync curated JSON from n8n by id: pnpm --filter @repo/n8n-workflows sync:n8n:package',
    '  - Push one curated workflow by id in file: pnpm --filter @repo/n8n-workflows push:n8n:workflow "<path-to-json>"',
  ].join('\n'),
)
process.exit(1)
