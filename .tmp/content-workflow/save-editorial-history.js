function safeNode(name) {
  try { return $(name).first()?.json || null; } catch { return null; }
}

const parsed = safeNode('Parse Post JSON') || safeNode('Select Best Draft') || $input.first()?.json || {};
const sched = safeNode('Editorial Scheduler') || safeNode('Duplicate Checker') || {};
const today = $now.format('yyyy-MM-dd');

return [{ json: {
  date: today,
  category: sched.category || 'tech_news',
  topic: parsed.topic || sched.topic || '',
  headline: parsed.headline || '',
  url: parsed.primaryUrl || parsed.primary_url || sched.selectedStory?.link || '',
  published: true,
  contentType: sched.contentType || 'linkedin_post',
  savedAt: new Date().toISOString(),
} }];
