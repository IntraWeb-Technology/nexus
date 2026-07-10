function safeNode(name) {
  try { return $(name).first()?.json || null; } catch { return null; }
}

const upstream = $input.first().json;
const collected = safeNode('Collect and Score Sources');
const topicData = safeNode('Topic');

const topic = collected?.topic || topicData?.topic || upstream.topic || 'Breaking Tech News';
const postType = collected?.postType || topicData?.postType || upstream.postType || 'primary';
const pipelineSlot = collected?.pipelineSlot || topicData?.pipelineSlot || upstream.pipelineSlot || 'publish';
const publishNow = collected?.publishNow ?? topicData?.publishNow ?? upstream.publishNow ?? false;

let researchText = '';
if (typeof upstream.message === 'string') researchText = upstream.message;
else if (typeof upstream.content === 'string') researchText = upstream.content;
else researchText = JSON.stringify(upstream, null, 2);
researchText = researchText.replace(/\r/g, '');

const rawCitations = Array.isArray(upstream.citations)
  ? upstream.citations.filter((url) => typeof url === 'string' && /^https?:\/\//i.test(url))
  : [];

function cleanUrl(url) { return (url || '').trim().replace(/[.,;:!?\)\]]+$/, ''); }
function urlScore(url) {
  try {
    const pathParts = new URL(url).pathname.split('/').filter(Boolean);
    if (/youtube\.com|youtu\.be|vimeo\.com/i.test(url)) return 100;
    if (pathParts.length >= 3) return 85;
    if (pathParts.length >= 1) return 55;
    return 5;
  } catch { return 0; }
}
function isArticleUrl(url) { return urlScore(cleanUrl(url)) >= 50; }
function pickPrimaryUrl(urls) {
  const unique = [...new Set(urls.map(cleanUrl).filter(Boolean))];
  return unique.sort((a, b) => urlScore(b) - urlScore(a)).find(isArticleUrl) || unique[0] || '';
}
function extractUrls(text) { return (text.match(/https?:\/\/[^\s\)\]"'<>]+/gi) || []).map(cleanUrl); }
function extractSourceUrls(text) {
  return [...new Set([...text.matchAll(/^Source URL:\s*(.+)$/gim)].flatMap((m) => extractUrls(m[1])))];
}
function splitStoryBlocks(text) {
  return text.split(/(?:^|\n)---+(?:\n|$)/).map((b) => b.replace(/^---+\s*/m, '').trim()).filter((b) => /STORY\s+\d+/i.test(b));
}
function resolveCitationRefs(text, citationList) {
  return text.replace(/Source URL:\s*\[(\d+)\]/gi, (_, n) => {
    const url = citationList[Number(n) - 1] || citationList[Number(n)] || citationList[0];
    return url && /^https?:\/\//i.test(url) ? `Source URL: ${url}` : `Source URL: ${url || `[${n}]`}`;
  });
}

researchText = resolveCitationRefs(researchText, rawCitations);
const sourceUrlsFromText = extractSourceUrls(researchText);
const citations = [...new Set([...sourceUrlsFromText.filter(isArticleUrl), ...rawCitations.filter(isArticleUrl)])];
let storyBlocks = splitStoryBlocks(researchText);
if (!storyBlocks.length && citations.length) {
  storyBlocks = citations.map((url, i) => `### STORY ${i + 1}\nTitle: Story ${i + 1}\nSource URL: ${url}`);
}

const stories = storyBlocks.map((block, index) => {
  const storyIndex = Number((block.match(/STORY\s+(\d+)/i) || [])[1]) || index + 1;
  const titleMatch = block.match(/Title:\s*(.+)/i);
  const title = (titleMatch?.[1] || `Story ${storyIndex}`).replace(/^\*+|\*+$/g, '').trim();
  const blockUrls = [...extractSourceUrls(block), ...extractUrls(block)];
  const fallbackUrls = blockUrls.length ? blockUrls : [citations[storyIndex - 1], citations[index], citations[0]].filter(Boolean);
  return { index: storyIndex, title, primaryUrl: pickPrimaryUrl(fallbackUrls), sourceUrls: blockUrls.filter(isArticleUrl) };
}).filter((s) => s.primaryUrl).sort((a, b) => a.index - b.index);

const storyCatalog = stories.length
  ? stories.map((s) => `${s.index}. ${s.title}\n   Source: ${s.primaryUrl}`).join('\n')
  : citations.map((url, i) => `${i + 1}. Source: ${url}`).join('\n');

return [{ json: { topic, postType, pipelineSlot, publishNow, stories, citations, sourceUrlsFromText, storyCatalog, researchText: `${researchText}\n\n## Story catalog:\n${storyCatalog}` } }];
