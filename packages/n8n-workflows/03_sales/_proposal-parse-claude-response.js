const raw = $('Call Claude API').first().json;
const text = (raw.content && raw.content[0] && raw.content[0].text) ? raw.content[0].text : '';
const d = $('Extract Deal Data').first().json;

const START = '<<<PAIN_SUMMARY>>>';
const END = '<<<END_PAIN_SUMMARY>>>';

let painSummaryForShell = '';
let bodyHtml = String(text || '').trim();

const si = bodyHtml.indexOf(START);
const ei = bodyHtml.indexOf(END);
if (si !== -1 && ei !== -1 && ei > si) {
  painSummaryForShell = bodyHtml.slice(si + START.length, ei).trim();
  bodyHtml = (bodyHtml.slice(0, si) + bodyHtml.slice(ei + END.length)).trim();
}

return [
  {
    json: {
      data: { text: bodyHtml },
      html: bodyHtml,
      painSummaryForShell,
      fileName: `IntraWeb - ${d.clientName} - Proposal.pdf`,
    },
  },
];
