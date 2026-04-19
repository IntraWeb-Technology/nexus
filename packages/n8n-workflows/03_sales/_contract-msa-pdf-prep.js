const claudeResult = $('Parse Claude Response').first().json;
const d = $('Extract Deal Data').first().json;
const config = d.config || {};
const branding = config.branding || {};
const owner = (config && config.owner) || {};
const companyName = owner.companyName || 'IntraWeb Technologies LLC';
const ownerEmail = owner.email || '';
const ownerPhone = owner.phone || '';
const ownerName = owner.name || 'Authorized Representative';
const clientLegalName = d.company || d.clientName || 'Client';
const effectiveDate = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
const docId = d.dealId ? `MSA-${String(d.dealId).slice(0, 12)}` : `MSA-${Date.now().toString(36).toUpperCase()}`;

const exhibitBody =
  (claudeResult.data ? claudeResult.data.text : claudeResult.html || '').trim() ||
  '<p class="body-text">Exhibit A could not be generated.</p>';

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

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Master Services Agreement — ${escapeHtml(clientLegalName)}</title>
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
      margin-top: 28px;
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
    .party-box {
      border: 1px solid var(--iw-slate-100);
      border-radius: 10px;
      padding: 14px 16px;
      background: var(--iw-off-white);
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
    .body-text {
      font-size: 10pt;
      line-height: 1.75;
      color: var(--iw-slate-700);
      margin: 0 0 10px;
    }
    .proposal-body p,
    .proposal-body li {
      font-size: 10pt;
      line-height: 1.7;
      color: var(--iw-slate-700);
    }
    .msa-exhibit {
      border: 1px solid var(--iw-slate-100);
      border-radius: 12px;
      padding: 18px 20px;
      background: var(--iw-white);
    }
    .callout--slate {
      border-left: 4px solid var(--iw-slate-500);
      background: var(--iw-slate-50);
      padding: 14px 16px;
      border-radius: 0 10px 10px 0;
      margin-top: 20px;
    }
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      margin-top: 24px;
      break-inside: avoid;
    }
    .signature-grid__col {
      border-top: 1px solid var(--iw-slate-800);
      padding-top: 10px;
      min-height: 72px;
      font-size: 9pt;
      color: var(--iw-slate-600);
    }
    .signature-grid__role {
      font-weight: 700;
      color: var(--iw-slate-800);
      margin-bottom: 8px;
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
  </style>
</head>
<body>
  <div class="iw-page">
    <header class="doc-header">
      <div class="doc-header__left">${logoHtml}</div>
      <div>
        <div class="doc-header__doc-type">Service Agreement</div>
        <div class="doc-header__doc-id">${escapeHtml(docId)}</div>
      </div>
    </header>

    <section class="doc-hero">
      <div class="doc-hero__label">Service Agreement</div>
      <h1 class="doc-hero__title">Master Services Agreement</h1>
      <p class="doc-hero__subtitle">${escapeHtml(effectiveDate)} · ${escapeHtml(companyName)} · ${escapeHtml(clientLegalName)}</p>
    </section>

    <div class="doc-meta-bar">
      <div class="doc-meta-bar__item">
        <div class="doc-meta-bar__k">Client</div>
        <div class="doc-meta-bar__v">${escapeHtml(clientLegalName)}</div>
      </div>
      <div class="doc-meta-bar__item">
        <div class="doc-meta-bar__k">Effective date</div>
        <div class="doc-meta-bar__v">${escapeHtml(effectiveDate)}</div>
      </div>
      <div class="doc-meta-bar__item">
        <div class="doc-meta-bar__k">Provider</div>
        <div class="doc-meta-bar__v">${escapeHtml(companyName)}</div>
      </div>
    </div>

    <main class="doc-body">
      <section>
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>Parties</h2>
        <div class="kv-grid">
          <div class="party-box">
            <div class="kv-k">Client</div>
            <p class="body-text" style="margin: 0">
              <strong>${escapeHtml(clientLegalName)}</strong><br />
              Attn: ${escapeHtml(d.contactName || d.contactFirstName || '—')}<br />
              ${d.address ? escapeHtml(d.address) + '<br />' : ''}${d.contactEmail ? escapeHtml(d.contactEmail) : ''}
            </p>
          </div>
          <div class="party-box">
            <div class="kv-k">Provider</div>
            <p class="body-text" style="margin: 0">
              <strong>${escapeHtml(companyName)}</strong><br />
              ${ownerEmail ? escapeHtml(ownerEmail) : ''}${ownerPhone ? '<br />' + escapeHtml(ownerPhone) : ''}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>1. Services</h2>
        <p class="body-text">Provider will perform the professional services described in <strong>Exhibit A</strong> (Statement of Work), which is incorporated into this Agreement. Exhibit A may be updated by written agreement of the parties (including email).</p>
      </section>

      <section>
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>2. Fees and payment</h2>
        <p class="body-text">Fees are based on the commercial terms selected for this engagement unless otherwise agreed in writing.</p>
        <table class="line-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tier / package amount</td>
              <td class="num">${escapeHtml(formatCurrency(d.tierAmount))}</td>
            </tr>
            <tr>
              <td>Estimated upfront / setup</td>
              <td class="num">${escapeHtml(formatCurrency(d.upfrontDue))}</td>
            </tr>
            <tr>
              <td>Monthly recurring (if applicable)</td>
              <td class="num">${escapeHtml(formatCurrency(d.tierMonthly))}</td>
            </tr>
            <tr>
              <td>Launch / initial payment (estimate)</td>
              <td class="num">${escapeHtml(formatCurrency(d.launchBalance))}</td>
            </tr>
          </tbody>
        </table>
        <p class="body-text">Invoices are due per the payment instructions on the invoice unless a different schedule is agreed in writing. Late payments may incur suspension of work until accounts are current.</p>
      </section>

      <section>
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>3. Term</h2>
        <p class="body-text">This Agreement begins on the Effective Date and continues until the services in Exhibit A are completed and fees for completed work are paid, unless terminated earlier under Section 4.</p>
      </section>

      <section>
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>4. Termination</h2>
        <p class="body-text">Either party may terminate for material breach if the other party fails to cure within fifteen (15) days of written notice. Client remains responsible for fees for work performed through the termination date.</p>
      </section>

      <section>
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>5. Confidentiality</h2>
        <p class="body-text">Each party agrees to protect the other’s non-public business information using reasonable care and to use it only for this engagement.</p>
      </section>

      <section>
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>6. Intellectual property</h2>
        <p class="body-text">Client retains ownership of its pre-existing materials. Deliverables created specifically for Client are assigned to Client upon full payment, excluding Provider tools, templates, and general know-how.</p>
      </section>

      <section>
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>7. Limitation of liability</h2>
        <p class="body-text">To the maximum extent permitted by law, neither party is liable for indirect or consequential damages. Provider’s total liability under this Agreement for any claim is limited to the fees paid by Client to Provider in the three (3) months preceding the claim.</p>
      </section>

      <section>
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>8. Independent contractor</h2>
        <p class="body-text">Provider is an independent contractor. This Agreement does not create a partnership or employment relationship.</p>
      </section>

      <section>
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>9. Notices</h2>
        <p class="body-text">Notices may be sent to the emails listed above or to such other addresses as the parties designate in writing.</p>
      </section>

      <section>
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>10. Exhibit A — Statement of Work</h2>
        <div class="msa-exhibit proposal-body">${exhibitBody}</div>
      </section>

      <section>
        <h2 class="doc-section__title"><span class="doc-section__accent" aria-hidden="true"></span>11. Signatures</h2>
        <p class="body-text">By signing below, the parties agree to this Agreement including Exhibit A.</p>
        <div class="signature-grid">
          <div class="signature-grid__col">
            <div class="signature-grid__role">Client</div>
            <div><strong>${escapeHtml(clientLegalName)}</strong></div>
            <div style="margin-top: 16px">Name: ___________________________</div>
            <div>Title: ___________________________</div>
            <div>Date: ___________________________</div>
          </div>
          <div class="signature-grid__col">
            <div class="signature-grid__role">Provider</div>
            <div><strong>${escapeHtml(companyName)}</strong></div>
            <div style="margin-top: 16px">Name: ${escapeHtml(ownerName)}</div>
            <div>Title: Authorized Representative</div>
            <div>Date: ___________________________</div>
          </div>
        </div>
      </section>

      <div class="callout--slate">
        <p class="body-text" style="margin: 0">
          <strong>Important:</strong> This document is a business template for internal use. It is not legal advice. Have qualified counsel review and customize before execution. Electronic signature and filing are your team’s responsibility after internal approval in the master sheet.
        </p>
      </div>
    </main>

    <footer class="doc-footer">
      <div class="doc-footer__brand">IntraWeb</div>
      <div class="doc-footer__conf">Confidential — ${escapeHtml(clientLegalName)} · ${escapeHtml(companyName)}</div>
      <div class="doc-footer__page">Page 1</div>
    </footer>
  </div>
</body>
</html>`;

return [{ json: { html, fileName: `IntraWeb — ${d.clientName} — Master Services Agreement.pdf` } }];
