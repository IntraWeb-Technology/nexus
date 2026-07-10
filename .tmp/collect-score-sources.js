function safeNode(name) {
  try { return $(name).first()?.json || null; } catch { return null; }
}

const slot = safeNode('Execute Workflow Trigger') || $input.first()?.json || {};
const pipelineSlot = slot.pipelineSlot || 'prep';
const postType = slot.postType || 'primary';
const publishNow = slot.publishNow === true;

const UA = 'Mozilla/5.0 (compatible; IntraWebSocialBot/1.0; +https://intrawebtech.com)';
const SOURCE_WEIGHTS = { 'hacker-news': 10, 'github-trending': 9, 'product-hunt': 8, reddit: 7 };
const KEYWORDS = ['ai', 'software', 'engineering', 'developer', 'cloud', 'security', 'database', 'frontend', 'backend', 'devops', 'open source', 'startup', 'architecture', 'programming', 'api', 'kubernetes', 'typescript', 'python', 'react', 'llm'];

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
function normalizeTitle(title) { return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim(); }
function scoreStory(story) {
  let score = SOURCE_WEIGHTS[story.source] || 5;
  const ageHours = (now - new Date(story.publishedAt).getTime()) / 3600000;
  if (ageHours <= 24) score += 8; else if (ageHours <= 48) score += 4; else if (ageHours <= 72) score += 1;
  const haystack = `${story.title} ${story.summary}`.toLowerCase();
  for (const keyword of KEYWORDS) if (haystack.includes(keyword)) score += 1.5;
  try { if (new URL(story.link).pathname.split('/').filter(Boolean).length >= 2) score += 2; } catch {}
  return Math.round(score * 10) / 10;
}
const scored = [];
for (const story of all) {
  const key = `${normalizeTitle(story.title)}|${story.link}`;
  if (seen.has(key)) continue;
  seen.add(key);
  scored.push({ ...story, score: scoreStory(story) });
}
scored.sort((a, b) => b.score - a.score);
const topStories = scored.slice(0, 12);
if (!topStories.length) throw new Error(`All source fetches failed. Status: ${JSON.stringify(fetchStatus)}`);
return [{ json: { pipelineSlot, postType, publishNow, topic: topStories[0].title, topStories, storyCount: topStories.length, fetchStatus, collectedAt: new Date().toISOString(), generateFallback: slot.generateFallback === true } }];
