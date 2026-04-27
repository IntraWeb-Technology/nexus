const raw = $('Call Claude API').first().json;
const text = (raw.content && raw.content[0] && raw.content[0].text) ? raw.content[0].text : '';
const d = $('Extract Deal Data').first().json;

const PAIN_START = '<<<PAIN_SUMMARY>>>';
const PAIN_END = '<<<END_PAIN_SUMMARY>>>';
const INV_START = '<<<INVESTMENT_SUMMARY>>>';
const INV_END = '<<<END_INVESTMENT_SUMMARY>>>';

let painSummaryForShell = '';
let investmentSummaryForShell = '';
let bodyHtml = String(text || '').trim();

const si = bodyHtml.indexOf(PAIN_START);
const ei = bodyHtml.indexOf(PAIN_END);
if (si !== -1 && ei !== -1 && ei > si) {
  painSummaryForShell = bodyHtml.slice(si + PAIN_START.length, ei).trim();
  bodyHtml = (bodyHtml.slice(0, si) + bodyHtml.slice(ei + PAIN_END.length)).trim();
}

const vi = bodyHtml.indexOf(INV_START);
const vj = bodyHtml.indexOf(INV_END);
if (vi !== -1 && vj !== -1 && vj > vi) {
  investmentSummaryForShell = bodyHtml.slice(vi + INV_START.length, vj).trim();
  bodyHtml = (bodyHtml.slice(0, vi) + bodyHtml.slice(vj + INV_END.length)).trim();
}

return [
  {
    json: {
      data: { text: bodyHtml },
      html: bodyHtml,
      painSummaryForShell,
      investmentSummaryForShell,
      fileName: `IntraWeb - ${d.clientName} - Proposal.pdf`,
    },
  },
];
