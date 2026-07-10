const input = $input.first()?.json || {};
const historyRows = $('Load Editorial History').all().map((i) => i.json);
const draftRows = $('Load Queued Drafts').all().map((i) => i.json);

function normalizeTitle(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function tokenize(text) {
  return new Set(normalizeTitle(text).split(' ').filter((w) => w.length > 3));
}

function jaccard(a, b) {
  const A = tokenize(a);
  const B = tokenize(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter += 1;
  return inter / (A.size + B.size - inter);
}

function cleanUrl(url) {
  try {
    const u = new URL(String(url || '').trim());
    return `${u.hostname}${u.pathname}`.toLowerCase().replace(/\/$/, '');
  } catch {
    return normalizeTitle(url);
  }
}

const candidates = [];
if (input.selectedStory?.title) candidates.push(input.selectedStory);
for (const s of input.topStories || []) candidates.push(s);

const seenTitles = new Set();
const seenUrls = new Set();
for (const row of [...historyRows, ...draftRows]) {
  if (row.headline) seenTitles.add(normalizeTitle(row.headline));
  if (row.topic) seenTitles.add(normalizeTitle(row.topic));
  if (row.url) seenUrls.add(cleanUrl(row.url));
  if (row.primary_url) seenUrls.add(cleanUrl(row.primary_url));
}

let picked = null;
let duplicateReason = '';

for (const story of candidates) {
  const titleKey = normalizeTitle(story.title);
  const urlKey = cleanUrl(story.link);
  if (seenUrls.has(urlKey)) {
    duplicateReason = `URL already used: ${story.link}`;
    continue;
  }
  let tooSimilar = false;
  for (const seen of seenTitles) {
    if (jaccard(seen, titleKey) >= 0.72) {
      tooSimilar = true;
      duplicateReason = `Headline too similar to recent post: ${story.title}`;
      break;
    }
  }
  if (tooSimilar) continue;
  picked = story;
  break;
}

if (!picked && input.fallbackTopic) {
  return [{ json: {
    ...input,
    topic: input.fallbackTopic,
    selectedStory: null,
    duplicateBlocked: false,
    usedFallback: true,
    duplicateReason,
    skipResearch: true,
  } }];
}

if (!picked) {
  return [{ json: {
    ...input,
    duplicateBlocked: true,
    skipPublish: true,
    duplicateReason: duplicateReason || 'All candidate stories are duplicates of recent content',
  } }];
}

return [{ json: {
  ...input,
  topic: picked.title,
  selectedStory: picked,
  duplicateBlocked: false,
  duplicateReason: '',
} }];
