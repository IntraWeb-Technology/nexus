function safeNode(name) {
  try { return $(name).first()?.json || null; } catch { return null; }
}

const research = safeNode('Format Research') || $input.first()?.json || {};
const sched = safeNode('Editorial Scheduler') || safeNode('Duplicate Checker') || {};
const today = $now.format('yyyy-MM-dd');

const payload = {
  researchText: research.researchText || research.message || '',
  stories: research.stories || [],
  citations: research.citations || [],
  storyCatalog: research.storyCatalog || '',
  category: sched.category,
  categoryLabel: sched.categoryLabel,
  topic: research.topic || sched.topic,
  contentType: sched.contentType || 'linkedin_post',
};

return [{ json: {
  date: today,
  post_type: 'research',
  headline: `[research] ${sched.categoryLabel || sched.category || 'content'}`,
  message: JSON.stringify(payload),
  topic: payload.topic || '',
  saved_at: new Date().toISOString(),
  status: 'research_ready',
} }];
