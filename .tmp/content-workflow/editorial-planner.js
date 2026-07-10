// Merged: editorial schedule + source collection + breaking news + duplicate check

const TZ = 'America/New_York';
const contentType = 'linkedin_post';
function tableRows(nodeName, keys) {
  return $(nodeName).all()
    .map((i) => i.json)
    .filter((r) => keys.some((k) => r[k] != null && String(r[k]).trim() !== ''));
}

const historyRows = tableRows('Load Editorial History', ['date', 'category', 'headline', 'topic']);
const draftRows = tableRows('Load Queued Drafts', ['date', 'message', 'headline', 'topic']);

const WEEKLY = {
  1: { category: 'tech_news', label: "Today's Tech News", focus: 'biggest engineering or technology story', examples: ['AI', 'Open Source', 'Cloud', 'Microsoft', 'Google', 'Apple', 'GitHub', 'Vercel', 'Docker'] },
  2: { category: 'software_engineering', label: 'Software Engineering', focus: 'architecture, patterns, and craft', examples: ['Architecture', 'Design Patterns', 'Performance', 'Testing', 'TypeScript', 'React', 'Next.js'] },
  3: { category: 'ai', label: 'AI', focus: 'LLMs, tooling, and agentic workflows', examples: ['LLMs', 'AI tooling', 'Agentic workflows', 'MCP', 'Prompt Engineering', 'Automation', 'AI development'] },
  4: { category: 'deep_dive', label: 'Engineering Deep Dive', focus: 'long-form educational technical post', examples: ['System Design', 'Scalability', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'Event Driven Architecture'], longForm: true },
  5: { category: 'weekly_roundup', label: 'Weekly Roundup', focus: 'summarize the week', examples: ['weekly technology roundup'] },
  6: { category: 'career', label: 'Career / Productivity', focus: 'leadership, productivity, and engineering culture', examples: ['Leadership', 'Developer productivity', 'Remote work', 'Interview advice', 'Lessons learned', 'Engineering culture'] },
  0: { category: 'evergreen', label: 'Evergreen', focus: 'best practices, tutorials, and timeless lessons', examples: ['Best practices', 'Tutorials', 'Coding tips', 'Architecture diagrams', 'Historical technology lessons'] },
};

const FALLBACK_TOPICS = ['engineering best practice', 'architecture lesson', 'React tip', 'Next.js optimization', 'TypeScript insight', 'Docker workflow', 'PostgreSQL tip', 'AI automation tutorial'];
const BREAKING_ENTITIES = ['openai', 'anthropic', 'google', 'apple', 'microsoft', 'github', 'docker', 'vercel', 'react', 'next.js', 'nextjs', 'typescript', 'cloudflare', 'aws', 'meta', 'nvidia'];
const BREAKING_SIGNALS = ['launch', 'released', 'announces', 'announcement', 'breaking', 'unveils', 'introduces', 'acquires', 'acquisition', 'outage', 'breach'];

const UA = 'Mozilla/5.0 (compatible; IntraWebSocialBot/1.0; +https://intrawebtech.com)';
const SOURCE_WEIGHTS = { 'hacker-news': 10, 'github-trending': 9, 'product-hunt': 8, reddit: 7 };
const KEYWORDS = ['ai', 'software', 'engineering', 'developer', 'cloud', 'security', 'database', 'frontend', 'backend', 'devops', 'open source', 'startup', 'architecture', 'programming', 'api', 'kubernetes', 'typescript', 'python', 'react', 'llm'];

function todayEt() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
function dayOfWeekEt() {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).formatToParts(new Date());
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[parts.find((p) => p.type === 'weekday')?.value || 'Mon'] ?? 1;
}
function daysBetween(a, b) {
  const da = Date.parse(a); const db = Date.parse(b);
  if (!da || !db) return 999;
  return Math.abs(da - db) / 86400000;
}
function normalizeTitle(text) { return String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim(); }
function tokenize(text) { return new Set(normalizeTitle(text).split(' ').filter((w) => w.length > 3)); }
function jaccard(a, b) {
  const A = tokenize(a); const B = tokenize(b);
  if (!A.size || !B.size) return 0;
  let inter = 0; for (const t of A) if (B.has(t)) inter += 1;
  return inter / (A.size + B.size - inter);
}
function cleanUrl(url) {
  try { const u = new URL(String(url || '').trim()); return `${u.hostname}${u.pathname}`.toLowerCase().replace(/\/$/, ''); }
  catch { return normalizeTitle(url); }
}

async function fetchText(url) {
  try {
    const body = await this.helpers.httpRequest({ method: 'GET', url, headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/xml, text/xml, */*' }, timeout: 30000 });
    const text = typeof body === 'string' ? body : JSON.stringify(body);
    if (/502 Bad Gateway|<title>502/i.test(text)) return '';
    return text;
  } catch { return ''; }
}
async function fetchHnStories() {
  for (const url of ['https://news.ycombinator.com/rss', 'https://hnrss.org/best?count=30']) {
    const xml = await fetchText.call(this, url);
    if (xml && /<item/i.test(xml)) return { xml, status: 'ok', via: url };
  }
  try {
    const ids = await this.helpers.httpRequest({ method: 'GET', url: 'https://hacker-news.firebaseio.com/v0/topstories.json', json: true, timeout: 30000 });
    const stories = [];
    for (const id of (ids || []).slice(0, 20)) {
      try {
        const item = await this.helpers.httpRequest({ method: 'GET', url: `https://hacker-news.firebaseio.com/v0/item/${id}.json`, json: true, timeout: 15000 });
        if (item?.title && item?.url) stories.push({ title: item.title, link: item.url, summary: '', source: 'hacker-news', publishedAt: new Date((item.time || Date.now() / 1000) * 1000).toISOString() });
      } catch {}
    }
    if (stories.length) return { stories, status: 'ok', via: 'firebase-api' };
  } catch {}
  return { xml: '', stories: [], status: 'failed', via: 'none' };
}
function parseRss(xml, source) {
  if (!xml || typeof xml !== 'string') return [];
  const blocks = xml.match(/<(?:item|entry)[\s\S]*?<\/(?:item|entry)>/gi) || [];
  const stories = [];
  for (const block of blocks) {
    const titleMatch = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const linkMatch = block.match(/<link[^>]*href="([^"]+)"/i) || block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    const descMatch = block.match(/<(?:description|summary|content)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:description|summary|content)>/i);
    const dateMatch = block.match(/<(?:pubDate|updated|published)[^>]*>([\s\S]*?)<\/(?:pubDate|updated|published)>/i);
    const title = (titleMatch?.[1] || '').replace(/<[^>]*>/g, '').trim();
    const link = (linkMatch?.[1] || '').replace(/<[^>]*>/g, '').trim();
    const summary = (descMatch?.[1] || '').replace(/<[^>]*>/g, '').trim().slice(0, 400);
    const publishedAt = dateMatch ? new Date(dateMatch[1].trim()) : new Date();
    if (!title || !link || !/^https?:\/\//i.test(link)) continue;
    stories.push({ title, link, summary, source, publishedAt: publishedAt.toISOString() });
  }
  return stories;
}

// --- Schedule ---
const dow = dayOfWeekEt();
const scheduled = WEEKLY[dow] || WEEKLY[1];
const recentCats = historyRows.filter((r) => r.published === true || r.published === 'true').map((r) => ({ category: r.category, daysAgo: daysBetween(todayEt(), r.date) }));
const tooRecent = new Set(recentCats.filter((r) => r.daysAgo < 14).map((r) => r.category));
let category = scheduled.category;
if (tooRecent.has(category)) {
  const alt = Object.values(WEEKLY).map((w) => w.category).find((c) => !tooRecent.has(c));
  if (alt) category = alt;
}
const schedule = Object.values(WEEKLY).find((w) => w.category === category) || scheduled;
const fallbackTopic = FALLBACK_TOPICS[Math.floor(Math.random() * FALLBACK_TOPICS.length)];

// --- Collect sources ---
const fetchStatus = {};
const all = [];
const hn = await fetchHnStories.call(this);
fetchStatus['hacker-news'] = hn.status;
if (hn.stories?.length) all.push(...hn.stories); else all.push(...parseRss(hn.xml, 'hacker-news'));
for (const [key, url] of [['github-trending', 'https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml'], ['reddit', 'https://www.reddit.com/r/programming+devops+technology/hot/.rss?limit=25'], ['product-hunt', 'https://www.producthunt.com/feed']]) {
  const xml = await fetchText.call(this, url);
  fetchStatus[key] = xml ? 'ok' : 'failed';
  all.push(...parseRss(xml, key));
}
const seen = new Set();
const now = Date.now();
function scoreStory(story) {
  let score = SOURCE_WEIGHTS[story.source] || 5;
  const ageHours = (now - new Date(story.publishedAt).getTime()) / 3600000;
  if (ageHours <= 24) score += 8; else if (ageHours <= 48) score += 4;
  const haystack = `${story.title} ${story.summary}`.toLowerCase();
  for (const keyword of KEYWORDS) if (haystack.includes(keyword)) score += 1.5;
  return Math.round(score * 10) / 10;
}
const topStories = [];
for (const story of all) {
  const key = `${normalizeTitle(story.title)}|${story.link}`;
  if (seen.has(key)) continue;
  seen.add(key);
  topStories.push({ ...story, score: scoreStory(story) });
}
topStories.sort((a, b) => b.score - a.score);

// --- Breaking news ---
function scoreBreaking(story) {
  const hay = `${story.title} ${story.summary}`.toLowerCase();
  let score = Number(story.score) || 0;
  for (const e of BREAKING_ENTITIES) if (hay.includes(e)) score += 12;
  for (const s of BREAKING_SIGNALS) if (hay.includes(s)) score += 6;
  const ageHours = (now - new Date(story.publishedAt).getTime()) / 3600000;
  if (ageHours <= 12) score += 10; else if (ageHours <= 24) score += 5;
  return score;
}
const ranked = topStories.map((s) => ({ ...s, breakingScore: scoreBreaking(s) })).sort((a, b) => b.breakingScore - a.breakingScore);
const breakingTop = ranked[0];
let categoryLabel = schedule.label;
let topic = `${schedule.label}: ${schedule.examples[Math.floor(Math.random() * schedule.examples.length)]}`;
let breakingNewsOverride = false;
if (breakingTop && breakingTop.breakingScore >= 28) {
  category = 'tech_news';
  categoryLabel = 'Breaking Tech News';
  topic = breakingTop.title;
  breakingNewsOverride = true;
}

// --- Duplicate check ---
const seenTitles = new Set();
const seenUrls = new Set();
for (const row of [...historyRows, ...draftRows]) {
  if (row.headline) seenTitles.add(normalizeTitle(row.headline));
  if (row.topic) seenTitles.add(normalizeTitle(row.topic));
  if (row.url) seenUrls.add(cleanUrl(row.url));
  if (row.primary_url) seenUrls.add(cleanUrl(row.primary_url));
}
let selectedStory = breakingNewsOverride ? breakingTop : ranked[0];
let skipRun = false;
let skipReason = '';
if (selectedStory) {
  const titleKey = normalizeTitle(selectedStory.title);
  const urlKey = cleanUrl(selectedStory.link);
  if (seenUrls.has(urlKey)) { skipRun = true; skipReason = `URL already used: ${selectedStory.link}`; }
  else {
    for (const t of seenTitles) {
      if (jaccard(t, titleKey) >= 0.72) { skipRun = true; skipReason = `Headline too similar: ${selectedStory.title}`; break; }
    }
  }
}
if (!skipRun && !selectedStory) {
  topic = fallbackTopic;
  selectedStory = null;
}

if (!skipRun && !topStories.length) {
  skipRun = true;
  skipReason = `All source fetches failed: ${JSON.stringify(fetchStatus)}`;
}

return [{ json: {
  contentType,
  postType: 'primary',
  category,
  categoryLabel,
  categoryFocus: schedule.focus,
  topic: selectedStory?.title || topic,
  fallbackTopic,
  longForm: schedule.longForm === true,
  skipResearch: ['evergreen', 'career', 'deep_dive'].includes(category),
  breakingNewsOverride,
  selectedStory,
  topStories: ranked.slice(0, 12),
  storyCount: ranked.length,
  skipRun,
  skipReason,
  editorialDate: todayEt(),
  pickedAt: new Date().toISOString(),
} }];
