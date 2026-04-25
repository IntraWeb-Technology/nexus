console.error(
  [
    '[DEPRECATED] apps/iw-site/scripts/pull-n8n-workflow.mjs has been retired.',
    'Use canonical package scripts:',
    '  - Full remote export: pnpm --filter @repo/n8n-workflows pull:n8n',
    '  - Curated file overwrite by id: pnpm --filter @repo/n8n-workflows sync:n8n:package',
    '',
    'If you need a single workflow file update, pull and then copy the matching id file',
    'from packages/n8n-workflows/_synced-from-n8n/.',
  ].join('\n'),
)
process.exit(1)
