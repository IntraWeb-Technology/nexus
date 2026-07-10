function safeNode(name) {
  try { return $(name).first()?.json || null; } catch { return null; }
}

const post = safeNode('Prepare Post') || {};
const TZ = 'America/New_York';
const today = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

return [{ json: {
  date: today,
  category: post.category || 'tech_news',
  topic: post.topic || '',
  headline: post.headline || '',
  url: post.primaryUrl || '',
  published: false,
} }];
