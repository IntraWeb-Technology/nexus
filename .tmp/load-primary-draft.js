function safeAll(name) {
  try { return $(name).all().map((item) => item.json); } catch { return []; }
}

// Match Get Today's Draft filter ($now.format) — not UTC ISO date
const today = $now.format('yyyy-MM-dd');
const slot = $('Init Primary Slot').first()?.json || { pipelineSlot: 'publish', postType: 'primary', publishNow: false };
const rows = safeAll("Get Today's Draft");

function isValidDraft(row) {
  const msg = String(row?.message || '').trim();
  return msg && !msg.startsWith('{') && !msg.includes('Unable to parse writer output');
}

// Query already filters by today's date; don't re-compare with a mismatched timezone
const row = rows.find(isValidDraft);

if (row?.message) {
  return [{ json: {
    hasDraft: true,
    headline: row.headline,
    message: row.message,
    short_message: row.short_message,
    primaryUrl: row.primary_url,
    topic: row.topic,
    story_index: row.story_index,
    story_title: row.story_title,
    saved_at: row.saved_at,
    date: row.date || today,
    pipelineSlot: 'publish',
    postType: 'primary',
    publishNow: slot.publishNow === true,
    loadedFrom: `data-table (${row.date || today})`,
  } }];
}

return [{ json: {
  hasDraft: false,
  pipelineSlot: slot.pipelineSlot || 'publish',
  postType: slot.postType || 'primary',
  publishNow: slot.publishNow === true,
  generateFallback: true,
  draftMissing: true,
  message: `No saved draft for ${today}. Generating content inline before saving to Postiz as draft.`,
} }];
