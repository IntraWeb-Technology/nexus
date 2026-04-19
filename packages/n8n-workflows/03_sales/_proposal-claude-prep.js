const d = $('Extract Deal Data').first().json;
const intakePainPoints =
  [d.rawPainPoints, d.painPointSummary].filter(Boolean).join('\n') || d.painPoints || '(None provided)';

const fmtMoney = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(x);
};

const lineItems = Array.isArray(d.lineItems) ? d.lineItems : [];
const lineItemsBlock = lineItems.length
  ? lineItems
      .map(
        (li, i) =>
          `  ${i + 1}. ${li.name || 'Item'} — Qty ${li.quantity ?? 1} — ${fmtMoney(li.amount)}\n` +
          (li.description ? `     Notes: ${li.description}\n` : ''),
      )
      .join('')
  : '(No line items in payload — scope from tier and pain points only.)';

const lineItemsRules = lineItems.length
  ? 'When LINE ITEMS are present: treat each line item as a distinct sellable component (e.g. website vs automation). Include at least one scope block that maps to each line item by name, in addition to tying work to pain points. Min 2, max 4 blocks total.'
  : 'one scope block per major pain point. Min 2, max 4 blocks.';

return [
  {
    json: {
      systemPrompt: `You are writing a polished consulting proposal body for IntraWeb Technologies LLC.
We are the implementation partner — not a generic advisor. Tone: direct, credible, senior, specific.

OUTPUT RULES:
- Return ONLY the inner HTML body content. No DOCTYPE, no <html>, no <head>, no <body> tags.
- No markdown. No backticks. No prose outside of HTML tags.
- The PDF shell already renders header, client snapshot, investment table, intake callout, and footer — do NOT repeat those.
- For every inline style color, border-color, and background, use ONLY CSS variables from this set (never raw hex): var(--iw-slate-950) through var(--iw-slate-50), var(--iw-teal), var(--iw-teal-light), var(--iw-teal-dim), var(--iw-teal-ghost), var(--iw-orange), var(--iw-orange-dim), var(--iw-orange-ghost), var(--iw-white), var(--iw-off-white). Example: color: var(--iw-slate-700);
- Prefer semantic <ul>/<li> for bullet lists inside scope blocks when listing deliverables or milestones.
- Add page-break-inside: avoid to every card, scope block, phase block, and outcome card.

DESIGN SYSTEM — use these patterns (colors via variables only):

━━ SECTION TITLE ━━
<div style="font-size: 10pt; font-weight: 700; color: var(--iw-teal-dim); text-transform: uppercase; letter-spacing: 0.05em; margin: 22px 0 10px;">Section Title</div>

━━ PROSE PARAGRAPHS ━━
<p style="font-size: 9.5pt; color: var(--iw-slate-800); line-height: 1.6; margin-bottom: 10px;">Text here.</p>

━━ PAIN POINT CARD (use in "What You Told Us") ━━
<div style="border: 0.5px solid var(--iw-slate-100); margin-bottom: 8px; page-break-inside: avoid;">
  <div style="background: var(--iw-slate-50); padding: 8px 14px; border-bottom: 0.5px solid var(--iw-slate-100); font-size: 9pt; font-weight: 700; font-style: italic; color: var(--iw-slate-800);">[Pain Point Label]</div>
  <div style="padding: 10px 14px; font-size: 9.5pt; color: var(--iw-slate-800); line-height: 1.6;">[2–3 sentences: operational impact + what we're solving]</div>
</div>

━━ SCOPE BLOCK (one per major deliverable, in "Detailed Scope of Work") ━━
<div style="margin-bottom: 12px; page-break-inside: avoid;">
  <div style="background: var(--iw-slate-950); padding: 10px 14px;">
    <div style="font-size: 9.5pt; font-weight: 700; color: var(--iw-white);">[Deliverable Name]</div>
    <div style="font-size: 8.5pt; color: var(--iw-teal-light); margin-top: 3px; font-style: italic;">You said: [verbatim or close paraphrase of pain point]</div>
  </div>
  <div style="border: 0.5px solid var(--iw-slate-100); border-top: none; display: flex;">
    <div style="width: 3px; background: var(--iw-teal); flex-shrink: 0;"></div>
    <div style="padding: 10px 14px;">
      <div style="font-size: 9pt; color: var(--iw-slate-500); margin-bottom: 6px;">We will:</div>
      <ul style="margin:0;padding-left:18px;color:var(--iw-slate-800);font-size:9pt;line-height:1.55;">
        <li>[specific deliverable]</li>
        <li>[specific deliverable]</li>
        <li>[specific deliverable]</li>
      </ul>
    </div>
  </div>
</div>

━━ ROADMAP GRID (2×2, in "Implementation Roadmap") ━━
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 4px;">
  [Repeat 4×:]
  <div style="border: 0.5px solid var(--iw-slate-100); page-break-inside: avoid;">
    <div style="background: var(--iw-slate-950); padding: 8px 14px; display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 9pt; font-weight: 700; color: var(--iw-white);">[Phase Name]</div>
      <div style="font-size: 8pt; font-weight: 700; color: var(--iw-teal-light);">Weeks [X–Y]</div>
    </div>
    <div style="padding: 10px 14px;">
      <ul style="margin:0;padding-left:18px;color:var(--iw-slate-800);font-size:9pt;">
        <li>[milestone]</li>
        <li>[milestone]</li>
      </ul>
    </div>
  </div>
</div>

━━ OUTCOMES GRID (3-column cards, in "Expected Operational Outcomes") ━━
<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 4px;">
  [Repeat 5–6×:]
  <div style="border: 0.5px solid var(--iw-slate-100); border-top: 2px solid var(--iw-teal); padding: 12px 14px; page-break-inside: avoid;">
    <div style="font-size: 9.5pt; font-weight: 700; color: var(--iw-slate-800); margin-bottom: 5px;">[Outcome Title]</div>
    <div style="font-size: 9pt; color: var(--iw-slate-500); line-height: 1.5;">[1–2 sentences — measurable, industry-specific]</div>
  </div>
</div>

━━ WHY INTRAWEB BLOCK ━━
<div style="background: var(--iw-teal-ghost); border: 0.5px solid var(--iw-slate-100); padding: 20px 24px; margin-bottom: 4px; page-break-inside: avoid;">
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
    <div>
      <p style="font-size: 9.5pt; color: var(--iw-slate-800); line-height: 1.6; margin-bottom: 10px;">[Paragraph 1 — specific to their industry and pain points. No generic claims.]</p>
      <p style="font-size: 9.5pt; color: var(--iw-slate-800); line-height: 1.6;">[Paragraph 2 — execution focus, delivery speed, real results from day one.]</p>
    </div>
    <div>
      [Repeat 3×:]
      <div style="background: var(--iw-white); border: 0.5px solid var(--iw-slate-100); padding: 10px 14px; margin-bottom: 8px;">
        <div style="font-size: 9pt; font-weight: 700; color: var(--iw-slate-800); margin-bottom: 3px;">[Differentiator Title]</div>
        <div style="font-size: 8.5pt; color: var(--iw-slate-500);">[One sentence]</div>
      </div>
    </div>
  </div>
</div>

━━ NEXT STEPS GRID (2×2) ━━
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 4px;">
  [Repeat 4×:]
  <div style="display: flex; align-items: flex-start; gap: 12px; page-break-inside: avoid;">
    <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--iw-teal); color: var(--iw-white); font-size: 9pt; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">[N]</div>
    <div>
      <div style="font-size: 9.5pt; font-weight: 700; color: var(--iw-slate-800); margin-bottom: 3px;">[Action Title]</div>
      <div style="font-size: 9pt; color: var(--iw-slate-500); line-height: 1.5;">[Supporting sentence]</div>
    </div>
  </div>
</div>

CONTENT RULES:
1. Every section must directly reference the client's industry and pain points — no generic filler.
2. "What You Told Us": one pain point card per distinct pain point from the payload.
3. "Detailed Scope of Work": ${lineItemsRules}
4. "Implementation Roadmap": 4 phase cards — Foundation, Core Build, Integration, Launch & Optimization.
5. "Expected Outcomes": 5–6 cards. Measurable. Specific to their industry. No vague claims.
6. "Why IntraWeb": left column prose references their exact situation. Right column 3 differentiator pills.
7. "Next Steps": 4 steps. Step 1 = kickoff call within 48 hrs. Step 4 = system live in 8 weeks.
8. Do not fabricate facts not in the payload. If a detail is missing, write around it naturally.`,

      userPrompt: `Generate the proposal body for this client.

Client: ${d.clientName}
Company: ${d.company}
Industry: ${d.industry || 'Not provided'}
Primary Contact: ${d.contactName || d.contactFirstName || 'Not provided'}
Contact Email: ${d.contactEmail || 'Not provided'}
Tier: ${d.tierLabel}
Setup Fee: $${d.tierAmount || 0}
Monthly Retainer: $${d.tierMonthly || 0}
Upfront Due: $${d.upfrontDue || 0}
Launch Balance: $${d.launchBalance || 0}

LINE ITEMS (quoted components — scope and narrative must reflect each when present):
${lineItemsBlock}

PAIN POINTS — address every one explicitly:
"""
${intakePainPoints}
"""

Output the following sections in order using the design system components above:
1. Executive Summary — 2 prose paragraphs. Reference their specific operational challenges. If LINE ITEMS exist, summarize the bundle (e.g. website + automation) without inventing numbers not in the payload.
2. What You Told Us — one pain point card per pain point.
3. Detailed Scope of Work — when LINE ITEMS exist, align scope blocks with each line item by name and tie to pain points; otherwise one block per major pain point. "You said / We will" pattern. Use lists where appropriate.
4. Implementation Roadmap — 2×2 grid, 4 phase cards, Weeks 1–2 through 7–8.
5. Expected Operational Outcomes — 3-column grid, 5–6 outcome cards. Measurable and industry-specific.
6. Why IntraWeb — split block: left prose (2 paragraphs, industry-specific), right 3 differentiator pills.
7. Next Steps — 2×2 grid, 4 numbered steps with teal circle numbers.`,

      maxTokens: 8000,
    },
  },
];
