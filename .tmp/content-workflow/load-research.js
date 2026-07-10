function safeAll(name) {
  try { return $(name).all().map((item) => item.json); } catch { return []; }
}

const today = $now.format('yyyy-MM-dd');
const rows = safeAll("Get Today's Research");

let research = null;
for (const row of rows) {
  if (row.post_type !== 'research') continue;
  try {
    research = JSON.parse(row.message || '{}');
    research.topic = research.topic || row.topic;
    break;
  } catch {}
}

if (!research?.researchText && !research?.storyCatalog) {
  return [{ json: {
    hasResearch: false,
    pipelineSlot: 'generate',
    postType: 'primary',
    message: `No research saved for ${today}. Run research slot first.`,
  } }];
}

return [{ json: {
  hasResearch: true,
  ...research,
  pipelineSlot: 'generate',
  postType: 'primary',
  publishNow: false,
  loadedFrom: `research-row-${today}`,
} }];
