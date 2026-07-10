const input = $input.first()?.json || {};
const today = $now.format('yyyy-MM-dd');

if (!input.hasDraft) return [{ json: input }];

const msg = String(input.message || '').trim();
if (!msg || msg.startsWith('{') || msg.includes('Unable to parse writer output')) {
  throw new Error('Saved draft has invalid message. Re-run 7AM Prep.');
}

const savedMs = Date.parse(input.saved_at || '') || 0;
const ageHours = savedMs ? (Date.now() - savedMs) / 3600000 : 999;
const isToday = input.date === today || String(input.loadedFrom || '').includes(today);

if (!isToday || ageHours > 24) {
  return [{ json: {
    ...input,
    hasDraft: false,
    generateFallback: true,
    draftStale: true,
    message: `Draft is stale or missing for ${today}. Regenerating inline.`,
  } }];
}

return [{ json: { ...input, draftValid: true } }];
