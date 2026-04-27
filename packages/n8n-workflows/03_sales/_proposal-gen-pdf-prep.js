const claudeResult = $('Parse Claude Response').first().json;
const d = $('Extract Deal Data').first().json;
const config = d.config || {};
const branding = config.branding || {};
const owner = config.owner || {};
const companyName = owner.companyName || 'IntraWeb Technologies LLC';
const ownerEmail = owner.email || '';
const ownerPhone = owner.phone || '';
const ownerName = owner.name || 'John Schibelli';
const calendarLink = owner.calendarLink || '';
const bodyContent = (claudeResult.data ? claudeResult.data.text : claudeResult.html || '').trim();
const painSummaryForShell = String(claudeResult.painSummaryForShell || '').trim();
const investmentSummaryForShell = String(claudeResult.investmentSummaryForShell || '').trim();
const clientName = d.clientName || 'Client';
const proposalDate = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
const validThrough = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
const docId = d.dealId ? `DEAL-${String(d.dealId).slice(0, 12)}` : `PROP-${Date.now().toString(36).toUpperCase()}`;

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const noEmDash = (value) =>
  String(value ?? '')
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')
    .replace(/\u2212/g, '-')
    .replace(/—/g, '-');

const formatCurrency = (value) => {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numeric) ? numeric : 0);
};

const logoHtml = (() => {
  const b64 = branding.logoPdfBase64 || branding.logoDarkBase64;
  const url = branding.logoUrlDark || branding.logoUrl;
  if (b64 && String(b64).trim()) {
    const src = String(b64).startsWith('data:') ? b64 : `data:image/png;base64,${b64}`;
    return `<img class="doc-header__logo" src="${src}" alt="IntraWeb" height="36" />`;
  }
  if (url && String(url).trim()) {
    return `<img class="doc-header__logo" src="${escapeHtml(url)}" alt="IntraWeb" height="36" />`;
  }
  return `<div class="doc-header__wordmark" aria-hidden="true">IntraWeb</div>`;
})();

const stripIntakeJsonTails = (text) => {
  let s = String(text || '');
  for (const re of [
    /\nWebsite intake \(JSON\):[\s\S]*$/i,
    /\nWebsite intake \(structured fields\):[\s\S]*$/i,
  ]) {
    s = s.replace(re, '');
  }
  return s.trim();
};

/** Short themes for PDF - no raw intake dump, JSON, or PII. */
const summarizeIntakeForPdf = () => {
  const summary = String(d.painPointSummary || '').trim();
  if (summary) {
    const parts = summary
      .split(/[,;]\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) return noEmDash(parts.map((p) => `• ${p}`).join('\n'));
  }
  let raw = String(d.rawPainPoints || d.painPoints || '').trim();
  if (!raw) return 'No intake themes were captured for this opportunity.';
  raw = raw.split(/\n-{3,}\n/)[0].trim();
  raw = raw.replace(/Website intake \(JSON\):[\s\S]*?(?=\n-{3,}|\n===|$)/gi, '');
  raw = raw.replace(/Website intake \(structured fields\):[\s\S]*$/i, '');
  const lines = raw.split('\n').filter((ln) => {
    const t = ln.trim();
    if (!t) return false;
    if (/^(email|phone|name|firstname|lastname|business|location)\s*:/i.test(t)) return false;
    if (/^===\s*Website intake/i.test(t)) return false;
    return true;
  });
  raw = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  if (raw.length > 2400) raw = `${raw.slice(0, 2400).trim()}…`;
  return noEmDash(raw || 'No intake themes were captured for this opportunity.');
};

const contactDisplay = d.contactName || d.contactFirstName || '';
const lineItems = Array.isArray(d.lineItems) ? d.lineItems : [];
const lineItemsSubtotal =
  Number(d.lineItemsSubtotal) ||
  lineItems.reduce((s, x) => s + (Number(x.amount) || 0), 0);
const discPdf = Math.max(0, Number(d.totalDiscount) || 0);
const dealAmtPdf = Number(d.dealAmount) || 0;
const tierAmtPdf = Number(d.tierAmount) || 0;

/** When line items exist, quoted total follows the table (subtotal − discounts), not a mismatched HubSpot deal amount. */
const finalQuotedPdf =
  lineItemsSubtotal > 0
    ? Math.max(0, lineItemsSubtotal - discPdf)
    : dealAmtPdf > 0
      ? dealAmtPdf
      : tierAmtPdf;

const upfrontPdf = Math.round(finalQuotedPdf * 0.4 * 100) / 100;
const remainingBalancePdf = Math.max(0, finalQuotedPdf - upfrontPdf);
const upfrontDueText = formatCurrency(upfrontPdf);
const remainingBalanceText = formatCurrency(remainingBalancePdf);

const snapshotCompanyDisplay = noEmDash(String(d.companyDisplay || '').trim());
const snapshotCompanyCell = snapshotCompanyDisplay || 'Not specified';

const heroDisplayName = noEmDash(clientName || snapshotCompanyDisplay);

const snapshotEmail = noEmDash(
  String(d.contactEmailDisplay || d.contactEmail || '').trim(),
);
const snapshotIndustry = noEmDash(
  String(d.industryDisplay || d.industry || '').trim(),
);
const snapshotWebsite = noEmDash(String(d.website || '').trim());
const snapshotAddress = noEmDash(String(d.address || '').trim());

/** Defensive: lead-in should never echo table amounts if Claude includes them. */
const investmentLeadInPlain = (() => {
  let t = noEmDash(investmentSummaryForShell);
  t = t.replace(/\$\s*[\d,]+(?:\.\d{1,2})?\b/g, '').replace(/\b(?:USD|usd)\b/g, '');
  t = t.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return t;
})();

const dealTierFallback = String(
  d.dealTierHubspot || d.hubspotTierRaw || d.tierLabel || d.tier || '',
).trim();

const lineItemsRowsHtml = (() => {
  const colSpan2 = 2;
  const rows = [];
  if (lineItems.length) {
    for (const li of lineItems) {
      const itemTier = String(
        li.tier || d.dealTierHubspot || d.hubspotTierRaw || d.tierLabel || '',
      ).trim();
      const desc = String(li.description || '').trim();
      const itemBlock = [
        `<strong>${escapeHtml(li.name || 'Item')}</strong>`,
        desc
          ? `<div class="muted" style="margin-top: 4px; line-height: 1.45;">${escapeHtml(desc).replace(/\n/g, '<br/>')}</div>`
          : '',
      ].join('');
      const tierCell = itemTier
        ? escapeHtml(itemTier)
        : '<span class="muted">&nbsp;</span>';
      rows.push(
        `<tr><td>${itemBlock}</td><td class="line-table__tier">${tierCell}</td><td class="num">${escapeHtml(formatCurrency(li.amount))}</td></tr>`,
      );
    }
    rows.push(
      `<tr class="line-table__subtotal"><td colspan="${colSpan2}">Subtotal (line items)</td><td class="num">${escapeHtml(formatCurrency(lineItemsSubtotal))}</td></tr>`,
    );
    if (discPdf > 0.005) {
      rows.push(
        `<tr class="line-table__discount"><td colspan="${colSpan2}">Discounts</td><td class="num">-${escapeHtml(formatCurrency(discPdf))}</td></tr>`,
      );
    }
    rows.push(
      `<tr class="line-table__quoted"><td colspan="${colSpan2}"><strong>Quoted total</strong></td><td class="num"><strong>${escapeHtml(formatCurrency(finalQuotedPdf))}</strong></td></tr>`,
    );
  } else {
    const tierLabel = dealTierFallback;
    rows.push(
      `<tr><td class="muted">${escapeHtml(tierLabel ? 'Scope reflects deal tier' : 'No line items found')}</td><td class="line-table__tier">${escapeHtml(tierLabel || '—')}</td><td class="num"><strong>${escapeHtml(formatCurrency(finalQuotedPdf || d.tierAmount))}</strong></td></tr>`,
    );
    if (discPdf > 0.005) {
      rows.push(
        `<tr class="line-table__discount"><td colspan="${colSpan2}">Discounts</td><td class="num">-${escapeHtml(formatCurrency(discPdf))}</td></tr>`,
      );
    }
    rows.push(
      `<tr class="line-table__quoted"><td colspan="${colSpan2}"><strong>Quoted total</strong></td><td class="num"><strong>${escapeHtml(formatCurrency(finalQuotedPdf || d.tierAmount))}</strong></td></tr>`,
    );
  }
  return rows.join('');
})();

const investmentNarrativeHtml = investmentLeadInPlain
  ? `<p class="investment-narrative">${escapeHtml(investmentLeadInPlain).replace(/\n/g, '<br/>')}</p>`
  : lineItems.length
    ? '<p class="investment-narrative muted">The line items below reflect the proposed scope. Amounts and tier come from the deal record in HubSpot.</p>'
    : '<p class="investment-narrative muted">Quoted amount reflects the deal tier in HubSpot when no line item rows are present on the deal.</p>';

const calendarHtml = calendarLink
  ? `<p class="doc-body__cta"><a class="cta-pill" href="${escapeHtml(calendarLink)}">Book approval call</a></p>`
  : '';

const safeBodyContent =
  bodyContent ||
  '<h2 class="doc-prose-h2">Executive Summary</h2><p class="body-text">Proposal content could not be generated.</p>';

const bodyInner = (() => {
  if (!safeBodyContent) return '';
  if (/^\s*</.test(safeBodyContent)) return safeBodyContent;
  return safeBodyContent
    .split(/\n\n+/)
    .map((block) => {
      const t = block.trim();
      if (!t) return '';
      return `<p class="body-text">${escapeHtml(t).replace(/\n/g, '<br/>')}</p>`;
    })
    .join('');
})();

/** "What we heard" is Claude's professional summary of the website intake, not the raw JSON object. */
const whatWeHeardBase =
  painSummaryForShell ||
  summarizeIntakeForPdf() ||
  stripIntakeJsonTails(String(d.rawPainPoints || d.painPoints || '')).trim();
const whatWeHeardPlain = noEmDash(whatWeHeardBase);
const whatWeHeardBody =
  whatWeHeardPlain.replace(/\s+/g, ' ').length >= 3
    ? whatWeHeardPlain
    : 'No website intake text was found on this deal. Add website intake details and re-run.';
const whatWeHeardSection = `<section class="doc-section doc-section--pain-shell">
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>What we heard</h2>
        <p class="body-text pain-shell">${escapeHtml(whatWeHeardBody).replace(/\n/g, '<br/>')}</p>
      </section>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Proposal - ${escapeHtml(clientName)} - ${escapeHtml(companyName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
  <style>
    :root {
      --iw-slate-950: #0d1117;
      --iw-slate-900: #141b26;
      --iw-slate-800: #1c2636;
      --iw-slate-700: #253347;
      --iw-slate-600: #344659;
      --iw-slate-500: #4a6075;
      --iw-slate-400: #6b8399;
      --iw-slate-300: #96aebe;
      --iw-slate-200: #c4d1da;
      --iw-slate-100: #e4eaef;
      --iw-slate-50: #f2f5f8;
      --iw-teal: #00c2a8;
      --iw-teal-light: #00dfc8;
      --iw-teal-dim: #007a6a;
      --iw-teal-ghost: #e0f8f5;
      --iw-orange: #f26419;
      --iw-orange-dim: #c04e0e;
      --iw-orange-ghost: #fef0e8;
      --iw-white: #ffffff;
      --iw-off-white: #f8fafb;
      --iw-print-footer-block: 0.55in;
    }
    @page {
      size: 8.5in 11in;
      margin: 0 !important;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    /**
     * PDF/headless Chromium: variable DM Sans (opsz axis) often misfits metrics (e.g. thick "l", broken kerning).
     * Use static weights + disable synthesis and optical size so text matches embedded outlines.
     */
    html,
    body {
      margin: 0 !important;
      padding: 0 !important;
      background: var(--iw-slate-50);
      color: var(--iw-slate-700);
      font-family: 'DM Sans', 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif;
      font-kerning: normal;
      font-synthesis: none;
      font-optical-sizing: none;
      font-variant-ligatures: common-ligatures;
      text-rendering: auto;
      letter-spacing: normal;
    }
    .iw-page {
      width: 100%;
      max-width: none;
      min-height: 10in;
      margin: 0;
      padding: 0;
      background: var(--iw-slate-50);
      color: var(--iw-slate-700);
    }
    @media print {
      .iw-page {
        width: 100%;
        min-height: 0;
        margin: 0;
      }
    }
    .doc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 0.45in;
      background: var(--iw-slate-950);
      border-bottom: 3px solid var(--iw-teal);
      color: var(--iw-white);
      margin-top: 0;
    }
    .doc-header__logo {
      height: 36px;
      width: auto;
      display: block;
    }
    .doc-header__wordmark {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--iw-white);
    }
    .doc-header__doc-type {
      font-size: 9pt;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--iw-slate-300);
    }
    .doc-header__doc-id {
      font-size: 10pt;
      font-weight: 600;
      color: var(--iw-white);
      margin-top: 4px;
      text-align: right;
    }
    .doc-hero {
      background: var(--iw-slate-900);
      padding: 28px 0.45in 26px;
      color: var(--iw-white);
    }
    .doc-hero__label {
      display: inline-block;
      font-size: 9pt;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--iw-orange);
      margin-bottom: 10px;
    }
    .doc-hero__label::before {
      content: '';
      margin-right: 0;
      color: var(--iw-orange);
    }
    .doc-hero__title {
      margin: 0 0 10px;
      font-size: 24pt;
      font-weight: 700;
      line-height: 1.15;
      color: var(--iw-white);
    }
    .doc-hero__subtitle {
      margin: 0;
      max-width: none;
      font-size: 11pt;
      line-height: 1.55;
      color: var(--iw-slate-300);
    }
    .doc-meta-bar {
      display: flex;
      flex-wrap: wrap;
      padding: 0 0.45in;
      background: var(--iw-slate-800);
      color: var(--iw-slate-100);
      font-size: 9.5pt;
    }
    .doc-meta-bar__item {
      flex: 1 1 0;
      min-width: 140px;
      padding: 12px 16px;
      border-right: 1px solid var(--iw-slate-600);
    }
    .doc-meta-bar__item:last-child {
      border-right: none;
    }
    .doc-meta-bar__k {
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--iw-slate-400);
      margin-bottom: 4px;
    }
    .doc-meta-bar__v {
      font-weight: 600;
      color: var(--iw-white);
      word-break: break-word;
    }
    .doc-body {
      background: var(--iw-white);
      padding: 24px 0.45in 32px;
    }
    @media print {
      .doc-body {
        padding-bottom: calc(12pt + var(--iw-print-footer-block));
      }
    }
    .doc-body > * + * {
      margin-top: 32px;
    }
    .doc-section__title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12pt;
      font-weight: 700;
      margin: 0 0 14px;
      padding-bottom: 8px;
      border-bottom: 1.5px solid var(--iw-slate-100);
      color: var(--iw-slate-800);
    }
    .doc-section--pain-shell .pain-shell {
      font-size: 10pt;
      line-height: 1.65;
      color: var(--iw-slate-800);
      margin: 0;
    }
    .doc-section__accent {
      width: 4px;
      height: 18px;
      background: var(--iw-teal);
      flex-shrink: 0;
    }
    .kv-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px 20px;
    }
    .kv-grid--3col {
      grid-template-columns: 1fr 1fr 1fr;
    }
    .kv-grid .kv-k {
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--iw-slate-400);
      margin-bottom: 4px;
    }
    .kv-grid .kv-v {
      font-size: 10pt;
      color: var(--iw-slate-800);
      font-weight: 600;
      word-break: break-word;
    }
    .line-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
    }
    .line-table thead th {
      background: var(--iw-slate-950);
      color: var(--iw-white);
      text-align: left;
      padding: 10px 12px;
      font-weight: 700;
      font-size: 8.5pt;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .line-table thead th:nth-child(2) {
      text-align: center;
    }
    .line-table thead th:last-child {
      text-align: right;
    }
    .line-table td.line-table__tier {
      text-align: center;
      font-weight: 600;
      color: var(--iw-slate-700);
    }
    .investment-narrative {
      font-size: 10pt;
      line-height: 1.65;
      color: var(--iw-slate-800);
      margin: 0 0 16px;
    }
    .investment-narrative.muted {
      color: var(--iw-slate-500);
    }
    .line-table tbody tr:nth-child(odd) {
      background: var(--iw-off-white);
    }
    .line-table tbody tr:nth-child(even) {
      background: var(--iw-white);
    }
    .line-table td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--iw-slate-100);
      vertical-align: top;
    }
    .line-table td.num {
      text-align: right;
      font-weight: 700;
      color: var(--iw-slate-800);
      white-space: nowrap;
    }
    .line-table tbody tr.line-table__subtotal td {
      background: var(--iw-off-white);
      font-weight: 700;
      border-bottom: 1px solid var(--iw-slate-200);
    }
    .line-table tbody tr.line-table__discount td {
      color: var(--iw-orange-dim);
      font-weight: 700;
      background: var(--iw-orange-ghost);
    }
    .line-table tbody tr.line-table__quoted td {
      background: var(--iw-slate-50);
      font-weight: 700;
      font-size: 10.5pt;
      border-bottom: 1px solid var(--iw-slate-200);
    }
    .line-table tbody tr.line-table__schedule td {
      font-size: 8.5pt;
      font-weight: 600;
      color: var(--iw-slate-500);
      padding-top: 14px;
      border-bottom: 1px dashed var(--iw-slate-200);
    }
    .line-table tbody tr.line-table__total td {
      background: var(--iw-teal-ghost);
      border-bottom: none;
      color: var(--iw-teal-dim);
      font-weight: 700;
      font-size: 11pt;
    }
    .line-table .muted {
      color: var(--iw-slate-500);
      font-weight: 500;
    }
    .callout {
      border-left: 4px solid var(--iw-teal);
      background: var(--iw-teal-ghost);
      padding: 16px 18px;
      border-radius: 0 10px 10px 0;
    }
    .callout--orange {
      border-left-color: var(--iw-orange);
      background: var(--iw-orange-ghost);
    }
    .callout--slate {
      border-left-color: var(--iw-slate-500);
      background: var(--iw-slate-50);
    }
    .callout .quote {
      margin: 0 0 10px;
      font-size: 11pt;
      line-height: 1.65;
      color: var(--iw-slate-700);
      white-space: pre-wrap;
    }
    .callout .quote--themes {
      white-space: normal;
      font-size: 10pt;
      line-height: 1.65;
      max-height: none;
    }
    .body-text,
    .pain-shell,
    .investment-narrative {
      font-kerning: normal;
      letter-spacing: normal;
      font-synthesis: none;
    }
    .body-text {
      font-size: 10pt;
      line-height: 1.75;
      color: var(--iw-slate-700);
      margin: 0 0 10px;
    }
    .proposal-body .body-text,
    .proposal-body p {
      font-size: 10pt;
      line-height: 1.75;
      color: var(--iw-slate-700);
    }
    .proposal-body h2,
    .doc-prose-h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12pt;
      font-weight: 700;
      margin: 24px 0 12px;
      padding-bottom: 6px;
      border-bottom: 1.5px solid var(--iw-slate-100);
      color: var(--iw-slate-800);
      break-after: avoid;
    }
    .proposal-body h2::before,
    .doc-prose-h2::before {
      content: '';
      width: 4px;
      height: 18px;
      background: var(--iw-teal);
      flex-shrink: 0;
    }
    .proposal-body h3 {
      font-size: 11pt;
      font-weight: 700;
      margin: 18px 0 8px;
      color: var(--iw-slate-800);
    }
    .proposal-body ul,
    .proposal-body ol {
      margin: 0 0 12px;
      padding-left: 20px;
      color: var(--iw-slate-700);
      font-size: 10pt;
      line-height: 1.7;
    }
    .divider {
      height: 1px;
      background: var(--iw-slate-100);
      margin: 8px 0 0;
      border: none;
    }
    .doc-body__cta {
      margin: 8px 0 0;
    }
    .cta-pill {
      display: inline-block;
      text-decoration: none;
      background: var(--iw-teal);
      color: var(--iw-white);
      font-weight: 700;
      font-size: 10pt;
      padding: 11px 20px;
      border-radius: 999px;
    }
    .cta-pill:hover {
      background: var(--iw-teal-dim);
    }
    .doc-footer {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
      align-items: center;
      gap: 12px;
      padding: 12px 0.45in;
      background: var(--iw-slate-950);
      color: var(--iw-slate-300);
      font-size: 8pt;
    }
    @media print {
      .doc-footer {
        padding-left: 0.45in;
        padding-right: 0.45in;
      }
    }
    .doc-footer__brand {
      font-weight: 700;
      color: var(--iw-teal-light);
      letter-spacing: 0.04em;
    }
    .doc-footer__conf {
      text-align: center;
      color: var(--iw-slate-400);
      line-height: 1.4;
    }
    .doc-footer__page {
      text-align: right;
      color: var(--iw-slate-300);
      font-weight: 600;
    }
    .fine-print {
      font-size: 9pt;
      color: var(--iw-slate-500);
      line-height: 1.5;
      margin-top: 8px;
    }
    .proposal-body p,
    .proposal-body li,
    .body-text {
      orphans: 3;
      widows: 3;
    }
    @media print {
      html,
      body {
        height: auto;
      }
      main.doc-body > section:not(.proposal-body) {
        break-inside: auto;
        page-break-inside: auto;
      }
      .doc-body > section:not(.proposal-body) > .doc-section__title {
        break-after: avoid-page;
        page-break-after: avoid;
      }
      .doc-hero {
        break-after: avoid-page;
        page-break-after: avoid;
      }
      .doc-section__title {
        break-after: avoid-page;
        page-break-after: avoid;
        break-inside: avoid;
      }
      .kv-grid {
        break-inside: avoid-page;
        page-break-inside: avoid;
      }
      .line-table {
        break-inside: auto;
        page-break-inside: auto;
      }
      .line-table thead {
        display: table-header-group;
      }
      .line-table tbody tr {
        break-inside: avoid-page;
        page-break-inside: avoid;
      }
      .line-table tr.line-table__schedule,
      .line-table tr.line-table__schedule + tr,
      .line-table tr.line-table__schedule + tr + tr,
      .line-table tr.line-table__total {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .line-table tr.line-table__schedule {
        break-before: avoid;
        page-break-before: avoid;
      }
      .line-table tr.line-table__total {
        break-after: avoid;
        page-break-after: avoid;
      }
      .proposal-body h2,
      .doc-prose-h2 {
        break-after: avoid-page;
        page-break-after: avoid;
        break-inside: avoid;
      }
      .proposal-body .scope-card,
      .proposal-body .roadmap-card,
      .proposal-body .outcome-card,
      .proposal-body .next-step-card,
      .proposal-body .pain-card,
      .proposal-body .why-block,
      .proposal-body .section-card,
      .callout,
      .callout--orange,
      .callout--slate,
      .doc-section--pain-shell,
      .doc-section--intake-themes {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .proposal-body div[style*="display:grid"] > div,
      .proposal-body div[style*="display: grid"] > div {
        break-inside: avoid-page;
        page-break-inside: avoid;
      }
      .proposal-body hr.divider,
      .proposal-body hr.divider + p,
      .proposal-body hr.divider + p + .doc-body__cta {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .proposal-body hr.divider {
        break-before: avoid;
        page-break-before: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="iw-page">
    <header class="doc-header">
      <div class="doc-header__left">${logoHtml}</div>
      <div>
        <div class="doc-header__doc-type">Project Proposal</div>
        <div class="doc-header__doc-id">${escapeHtml(docId)}</div>
      </div>
    </header>

    <section class="doc-hero">
      <div class="doc-hero__label">Project Proposal</div>
      <h1 class="doc-hero__title">${escapeHtml(heroDisplayName)}</h1>
      <p class="doc-hero__subtitle">Delivery-focused implementation scope, commercial summary, and next steps, aligned to the operational context captured for this opportunity.</p>
    </section>

    <div class="doc-meta-bar">
      <div class="doc-meta-bar__item">
        <div class="doc-meta-bar__k">Prepared for</div>
        <div class="doc-meta-bar__v">${escapeHtml(clientName)}</div>
      </div>
      <div class="doc-meta-bar__item">
        <div class="doc-meta-bar__k">Prepared on</div>
        <div class="doc-meta-bar__v">${escapeHtml(proposalDate)}</div>
      </div>
      <div class="doc-meta-bar__item">
        <div class="doc-meta-bar__k">Account manager</div>
        <div class="doc-meta-bar__v">${escapeHtml(ownerName)}</div>
      </div>
      <div class="doc-meta-bar__item">
        <div class="doc-meta-bar__k">Valid through</div>
        <div class="doc-meta-bar__v">${escapeHtml(validThrough)}</div>
      </div>
    </div>

    <main class="doc-body">
      <section>
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>Client snapshot</h2>
        <div class="kv-grid kv-grid--3col">
          <div><div class="kv-k">Client</div><div class="kv-v">${escapeHtml(clientName)}</div></div>
          <div><div class="kv-k">Company</div><div class="kv-v">${escapeHtml(snapshotCompanyCell)}</div></div>
          <div><div class="kv-k">Primary contact</div><div class="kv-v">${escapeHtml(contactDisplay)}</div></div>
          <div><div class="kv-k">Email</div><div class="kv-v">${escapeHtml(snapshotEmail || 'Not specified')}</div></div>
          <div><div class="kv-k">Phone</div><div class="kv-v">${escapeHtml(noEmDash(String(d.contactPhone || '').trim()) || 'Not specified')}</div></div>
          <div><div class="kv-k">Industry</div><div class="kv-v">${escapeHtml(snapshotIndustry || 'Not specified')}</div></div>
          <div><div class="kv-k">Website</div><div class="kv-v">${escapeHtml(snapshotWebsite || 'Not specified')}</div></div>
          <div style="grid-column: span 2"><div class="kv-k">Address</div><div class="kv-v">${escapeHtml(snapshotAddress || 'Not specified')}</div></div>
        </div>
      </section>

      ${whatWeHeardSection}

      <section>
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>Investment summary</h2>
        ${investmentNarrativeHtml}
        <table class="line-table">
          <thead><tr><th>Item</th><th>Tier</th><th>Amount</th></tr></thead>
          <tbody>
            ${lineItemsRowsHtml}
            <tr class="line-table__schedule"><td colspan="3">Payment timing (estimate; final cadence on invoice)</td></tr>
            <tr><td colspan="2">Upfront due (40% of quoted total)</td><td class="num">${escapeHtml(upfrontDueText)}</td></tr>
            <tr class="line-table__total"><td colspan="2">Remaining balance</td><td class="num">${escapeHtml(remainingBalanceText)}</td></tr>
          </tbody>
        </table>
        <p class="fine-print">Payment split shown as 40% upfront and 60% remaining from quoted total. Final amounts on invoice.</p>
      </section>

      <section class="proposal-body">
        ${bodyInner}
        <hr class="divider" />
        <p class="body-text" style="margin-bottom: 4px"><strong>${escapeHtml(companyName)}</strong>${ownerEmail ? ` · ${escapeHtml(ownerEmail)}` : ''}${ownerPhone ? ` · ${escapeHtml(ownerPhone)}` : ''}</p>
        ${calendarHtml}
      </section>
    </main>

    <footer class="doc-footer">
      <div class="doc-footer__brand">IntraWeb</div>
      <div class="doc-footer__conf">Confidential - prepared for ${escapeHtml(clientName)}. Distribution outside the parties requires written consent.</div>
      <div class="doc-footer__page">Page 1</div>
    </footer>
  </div>
</body>
</html>`;

return [{ json: { html, fileName: `IntraWeb - ${d.clientName} - Proposal.pdf` } }];
