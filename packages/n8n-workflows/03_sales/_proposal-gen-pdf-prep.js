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

const summaryPainPoints = (d.painPointSummary || '')
  .split(/[,;]\s*/)
  .map((item) => item.trim())
  .filter(Boolean);

const painSummaryHtml = summaryPainPoints.length
  ? `<ul class="body-text">${summaryPainPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
  : '';

const rawPainBlock = d.rawPainPoints || d.painPoints || 'No pain points were provided in the payload.';
const contactDisplay = d.contactName || d.contactFirstName || '';
const tierAmountText = d.tierAmount ? formatCurrency(d.tierAmount) : 'Not provided';
const tierMonthlyText = formatCurrency(d.tierMonthly || 0);
const upfrontDueText = formatCurrency(d.upfrontDue || 0);
const launchBalanceText = formatCurrency(d.launchBalance || 0);
const lineItems = Array.isArray(d.lineItems) ? d.lineItems : [];
const lineItemsSubtotal = lineItems.reduce((s, x) => s + (Number(x.amount) || 0), 0);

const lineItemsRowsHtml = lineItems.length
  ? lineItems
      .map(
        (li) =>
          `<tr><td>${escapeHtml(li.name)} <span class="muted">(qty ${li.quantity ?? 1})</span>${li.description ? ' — ' + escapeHtml(String(li.description).slice(0, 120)) : ''}</td><td class="num">${escapeHtml(formatCurrency(li.amount))}</td></tr>`,
      )
      .join('') +
    `<tr><td><strong>Line items subtotal</strong></td><td class="num"><strong>${escapeHtml(formatCurrency(lineItemsSubtotal))}</strong></td></tr>`
  : '';

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

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Proposal — ${escapeHtml(clientName)} — ${escapeHtml(companyName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet" />
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
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    html,
    body {
      margin: 0;
      padding: 0;
      background: var(--iw-slate-50);
      color: var(--iw-slate-700);
      font-family: 'DM Sans', system-ui, sans-serif;
    }
    .iw-page {
      width: 816px;
      min-height: 1056px;
      margin: 0 auto;
      background: var(--iw-slate-50);
      color: var(--iw-slate-700);
    }
    .doc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 24px;
      background: var(--iw-slate-950);
      border-bottom: 3px solid var(--iw-teal);
      color: var(--iw-white);
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
      padding: 28px 32px 26px;
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
      content: '— ';
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
      max-width: 640px;
      font-size: 11pt;
      line-height: 1.55;
      color: var(--iw-slate-300);
    }
    .doc-meta-bar {
      display: flex;
      flex-wrap: wrap;
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
      padding: 32px 48px 40px;
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
    .line-table thead th:last-child {
      text-align: right;
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
    .line-table tbody tr.line-table__total td {
      background: var(--iw-teal-ghost);
      border-bottom: none;
      color: var(--iw-teal-dim);
      font-weight: 800;
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
      padding: 12px 24px;
      background: var(--iw-slate-950);
      color: var(--iw-slate-300);
      font-size: 8pt;
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
      <h1 class="doc-hero__title">${escapeHtml(d.company || clientName)}</h1>
      <p class="doc-hero__subtitle">Delivery-focused implementation scope, commercial summary, and next steps — aligned to the operational context captured for this opportunity.</p>
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
          <div><div class="kv-k">Company</div><div class="kv-v">${escapeHtml(d.company || '')}</div></div>
          <div><div class="kv-k">Primary contact</div><div class="kv-v">${escapeHtml(contactDisplay)}</div></div>
          <div><div class="kv-k">Email</div><div class="kv-v">${escapeHtml(d.contactEmail || '')}</div></div>
          <div><div class="kv-k">Phone</div><div class="kv-v">${escapeHtml(d.contactPhone || '')}</div></div>
          <div><div class="kv-k">Industry</div><div class="kv-v">${escapeHtml(d.industry || '')}</div></div>
          <div><div class="kv-k">Website</div><div class="kv-v">${escapeHtml(d.website || '')}</div></div>
          <div style="grid-column: span 2"><div class="kv-k">Address</div><div class="kv-v">${escapeHtml(d.address || '')}</div></div>
        </div>
      </section>

      <section>
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>Investment summary</h2>
        <table class="line-table">
          <thead><tr><th>Item</th><th>Amount</th></tr></thead>
          <tbody>
            ${lineItemsRowsHtml}
            <tr><td>Tier amount</td><td class="num">${escapeHtml(tierAmountText)}</td></tr>
            <tr><td>Tier monthly</td><td class="num">${escapeHtml(tierMonthlyText)}</td></tr>
            <tr><td>Upfront due</td><td class="num">${escapeHtml(upfrontDueText)}</td></tr>
            <tr class="line-table__total"><td>Launch balance</td><td class="num">${escapeHtml(launchBalanceText)}</td></tr>
          </tbody>
        </table>
        <p class="fine-print">Launch balance is due at approval and includes the remaining project balance plus the first month&rsquo;s subscription; tier monthly applies thereafter.</p>
      </section>

      <section>
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>Pain points from intake</h2>
        <div class="callout callout--orange">
          <p class="quote">${escapeHtml(rawPainBlock)}</p>
          ${painSummaryHtml}
        </div>
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
      <div class="doc-footer__conf">Confidential — prepared for ${escapeHtml(clientName)}. Distribution outside the parties requires written consent.</div>
      <div class="doc-footer__page">Page 1</div>
    </footer>
  </div>
</body>
</html>`;

return [{ json: { html, fileName: `IntraWeb — ${d.clientName} — Proposal.pdf` } }];
