function safeNode(name) {
  try { return $(name).first()?.json || null; } catch { return null; }
}

const parsed = $input.first()?.json || safeNode('Run Collect Research') || {};
const selected = parsed;
const today = $now.format('yyyy-MM-dd');

const draft = {
  date: today,
  post_type: 'primary',
  headline: selected.headline || parsed.headline || '',
  message: selected.message || parsed.message || '',
  short_message: selected.short_message || parsed.short_message || '',
  primary_url: parsed.primaryUrl || parsed.primary_url || '',
  topic: selected.topic || parsed.topic || '',
  story_index: selected.story_index || parsed.story_index || 1,
  story_title: parsed.story_title || '',
  saved_at: new Date().toISOString(),
  draftsGenerated: selected.draftsGenerated || 1,
};

if (!draft.message || draft.message.trim().startsWith('{') || draft.message.includes('Unable to parse writer output')) {
  throw new Error('Draft message is empty or invalid. Re-run 7AM Prep or check AI Writer output.');
}

return [{ json: {
  status: 'saved',
  date: today,
  draft,
  message: `Primary draft saved for ${today}. Ready for 8:00 AM publish.`,
} }];
