import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const original = fs.readFileSync(path.join(dir, "_tmp-pdf-prep.js"), "utf8");

const newPrefix = `const config = $('Get Config').first().json;
const branding = config.branding || {};
const owner = config.owner || {};
const companyName = owner.companyName || 'IntraWeb Technologies LLC';
const ownerEmail = owner.email || '';
const ownerPhone = owner.phone || '';
const ownerName = owner.name || 'John Schibelli';
const calendarLink = owner.calendarLink || '';

const c = $('Search HubSpot Contact').first().json || {};
const p = c.properties || {};

const dealRow = (() => {
  try {
    const rows = $('Fetch Deal by ID').all();
    if (rows.length && rows[0].json && rows[0].json.properties) return rows[0].json.properties;
  } catch (err) { /* branch not executed */ }
  try {
    const rows = $('Deal Fallback Empty').all();
    if (rows.length && rows[0].json && rows[0].json.properties) return rows[0].json.properties;
  } catch (err2) { /* branch not executed */ }
  return {};
})();

const fmtMoney = (value) => {
  const n = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const clientName = [p.firstname, p.lastname].filter(Boolean).join(' ').trim() || String(p.email || '').trim() || 'Client';
const d = {
  clientName,
  company: String(p.company || '').trim() || clientName,
  industry: String(p.industry || '').trim(),
  painPoints: String(p.message || '').trim(),
  painPointSummary: '',
  rawPainPoints: String(p.message || 'No intake message captured on the contact.').trim(),
  contactEmail: String(p.email || '').trim(),
  contactPhone: String(p.phone || '').trim(),
  contactFirstName: String(p.firstname || '').trim(),
  contactName: clientName,
  address: '',
  website: String(p.website || '').trim(),
  tierAmount: fmtMoney(dealRow.amount),
  tierMonthly: 0,
  upfrontDue: 0,
  launchBalance: 0,
  lineItems: [],
};

const rawProposal = String(($('Format Proposal Output').first().json || {}).proposalText || '').trim();

const proposalDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const logoSrc = branding.logoUrl || '';
`;

const bodyContentBlock = [
  "",
  "const bodyContent = (() => {",
  "  if (!rawProposal) return '';",
  "  if (/^\\s*</.test(rawProposal)) return rawProposal.trim();",
  "  return rawProposal",
  "    .split(/\\n\\n+/)",
  "    .map((block) => {",
  "      const t = block.trim();",
  "      if (!t) return '';",
  "      return `<p style=\"font-size: 9.5pt; color: #1a1f2e; line-height: 1.6; margin-bottom: 10px;\">${escapeHtml(t).replace(/\\n/g, '<br/>')}</p>`;",
  "    })",
  "    .join('');",
  "})();",
  "",
].join("\n");

let out = original.replace(/^[\s\S]*?(?=const escapeHtml)/m, newPrefix);
const anchor = "const formatCurrency";
const idx = out.indexOf(anchor);
if (idx === -1) throw new Error("formatCurrency not found");
out = out.slice(0, idx) + bodyContentBlock + "\n" + out.slice(idx);

fs.writeFileSync(path.join(dir, "_proposal-gen-pdf-prep.js"), out, "utf8");
console.log("Wrote _proposal-gen-pdf-prep.js", out.length);
