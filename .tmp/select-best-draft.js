function safeNode(name) {
  try { return $(name).first()?.json || null; } catch { return null; }
}

function extractJsonObject(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const cleaned = rawText.replace(/^```json\s*|```\s*$/g, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

function draftsFromParsed(parsed) {
  if (!parsed || typeof parsed !== 'object') return [];
  if (Array.isArray(parsed.drafts) && parsed.drafts.length) return parsed.drafts;
  if (parsed.headline || parsed.message) return [parsed];
  return [];
}

function writerText(writer) {
  if (!writer || typeof writer !== 'object') return '';
  if (typeof writer.text === 'string') return writer.text;
  if (Array.isArray(writer.content)) {
    return writer.content.find((c) => c.type === 'text')?.text || writer.content.map((c) => c.text || '').join('\n');
  }
  if (typeof writer.message === 'string') return writer.message;
  return '';
}

function buildResearchFallback(context) {
  const research = safeNode('Format Research') || {};
  const collected = safeNode('Collect and Score Sources') || {};
  const story = research.stories?.[0];
  const top = collected.topStories?.[0];
  const title = story?.title || top?.title || context.topic || 'Tech update';
  const summary = top?.summary || story?.title || '';
  const body = summary
    ? `${title}\n\n${summary}\n\nWhat stands out to you about this?`
    : `${title}\n\nWorth watching for teams building with modern AI tooling.\n\nWhat's your take?`;
  return {
    headline: title,
    message: body,
    short_message: body.length > 280 ? `${body.slice(0, 277)}...` : body,
    story_index: story?.index || 1,
    score: 0,
    generatedFrom: 'research-fallback',
  };
}

const writerItem = $('AI Writer').first()?.json || $input.first()?.json || {};
const context = safeNode('Collect and Score Sources') || safeNode('Topic') || safeNode('Format Research') || {};

let drafts = draftsFromParsed(writerItem);
if (!drafts.length && writerItem.output) drafts = draftsFromParsed(writerItem.output);
if (!drafts.length && writerItem.parsedOutput) drafts = draftsFromParsed(writerItem.parsedOutput);
if (!drafts.length) drafts = draftsFromParsed(extractJsonObject(writerText(writerItem)));

drafts = drafts.filter((d) => {
  const msg = String(d.message || d.headline || '').trim();
  return msg && !msg.includes('Unable to parse writer output');
});

function draftScore(draft) {
  let score = Number(draft.score) || 0;
  const msg = draft.message || '';
  if (msg.includes('?')) score += 10;
  if (msg.length >= 200 && msg.length <= 1400) score += 8;
  if (draft.headline) score += 5;
  if (msg.startsWith('{')) score -= 50;
  return score;
}

drafts.sort((a, b) => draftScore(b) - draftScore(a));
const winner = drafts[0] || buildResearchFallback(context);

return [{ json: {
  ...winner,
  draftsGenerated: drafts.length,
  topic: context.topic,
  postType: context.postType || 'primary',
  pipelineSlot: context.pipelineSlot || 'publish',
  publishNow: context.publishNow === true,
} }];
