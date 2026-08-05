import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wfPath = path.join(__dirname, "..", "03_sales", "SYS 03 — Contract Generation.json");
const outSdk = path.join(__dirname, "..", "_pulled", "_contract-gen-workflow-sdk.mjs");

const PREP_CLAUDE = [
  "const d = $('Extract Deal Data').first().json;",
  "const sc = [d.rawPainPoints, d.painPointSummary].filter(Boolean).join('\\n') || d.painPoints || '(None provided)';",
  "const pl = d.productList && d.productList.length > 0",
  "  ? d.productList.map(p => `  - ${p.name} (${p.sku}): $${Number(p.price).toLocaleString()}`).join('\\n')",
  "  : `  - Tier: ${d.tierLabel} — $${Number(d.tierAmount).toLocaleString()}`;",
  "",
  "const systemPrompt = `You are acting as an expert business and contract attorney specializing in New Jersey technology services law, drafting Exhibit A (Statement of Work) for a Master Services Agreement on behalf of IntraWeb Technologies LLC.",
  "",
  "COMPANY PROFILE",
  "Legal Name: IntraWeb Technologies LLC | New Jersey LLC",
  "Principal: John Schibelli | jschibelli@gmail.com | intrawebtech.com",
  "",
  "STANDARD TERMS",
  "Payment: Net 15. Late fee: 1.5%/month (18%/yr).",
  "Revisions: Starter/Website = 2 rounds included. Growth/Advanced = 3 rounds included. Additional rounds: $150-$175/hr after signed Change Order.",
  "Governing Law: State of New Jersey. Venue: Morris County.",
  "",
  "OUTPUT RULES",
  "Return ONLY clean semantic HTML for the Exhibit A body. No markdown, no backticks, no DOCTYPE, no html/head/body tags.",
  "Use only: h2, h3, p, ul, ol, li, strong.",
  "Do not include signatures, governing law, liability caps, or payment terms — those are in the MSA wrapper.",
  "Do not invent facts not in the payload. Use [CONFIRM WITH CLIENT] for missing data.`;",
  "",
  "const userPrompt = `Generate Exhibit A — Statement of Work.",
  "",
  "CLIENT: ${d.clientName} | ${d.company} | ${d.industry || 'industry not provided'} | ${d.contactEmail || 'email not provided'}",
  "",
  "ENGAGEMENT",
  "Tier: ${d.tierLabel}",
  "Products:",
  "${pl}",
  "Total: $${Number(d.tierAmount).toLocaleString()} | Monthly: $${Number(d.tierMonthly).toLocaleString()} | Upfront: $${Number(d.upfrontDue).toLocaleString()}",
  "",
  "DISCOVERY CONTEXT",
  "\"\"\"",
  "${sc}",
  "\"\"\"",
  "",
  "Sections: 1. Objectives 2. Deliverables and workstreams (reference SKUs) 3. Client responsibilities 4. Out of scope 5. Change request process (ref $150-$175/hr and Net 15)`;",
  "",
  "return [{ json: { systemPrompt, userPrompt, maxTokens: 3500 } }];",
].join("\n");

function ensureCodeMode(params) {
  if (!params || typeof params !== "object") return params;
  if (params.jsCode != null && params.mode == null) {
    return { mode: "runOnceForAllItems", language: "javaScript", ...params };
  }
  return params;
}

function buildConfig(n) {
  const cfg = {
    name: n.name,
    position: n.position,
    parameters: ensureCodeMode(JSON.parse(JSON.stringify(n.parameters || {}))),
  };
  if (n.id) cfg.id = n.id;
  if (n.webhookId) cfg.webhookId = n.webhookId;
  if (n.credentials) cfg.credentials = n.credentials;
  return cfg;
}

function varNameFor(n) {
  const id = n.id || n.name;
  return "n_" + String(id).replace(/[^a-zA-Z0-9]+/g, "_");
}

function emitNodeFactory(n) {
  const vn = varNameFor(n);
  const typeVer = n.typeVersion;
  const ver = typeof typeVer === "number" ? typeVer : Number(typeVer);
  const cfgLit = JSON.stringify(buildConfig(n));
  if (n.type === "n8n-nodes-base.if") {
    return { vn, code: `const ${vn} = ifElse({ type: ${JSON.stringify(n.type)}, version: ${ver}, config: ${cfgLit} });` };
  }
  const isTrig = n.type === "n8n-nodes-base.webhook";
  const factory = isTrig ? "trigger" : "node";
  const out = sampleOutputFor(n);
  return { vn, code: `const ${vn} = ${factory}({ type: ${JSON.stringify(n.type)}, version: ${ver}, config: ${cfgLit}, output: ${JSON.stringify(out)} });` };
}

function sampleOutputFor(n) {
  if (n.type === "n8n-nodes-base.webhook") return [{ body: { properties: {} } }];
  return [{}];
}

const wf = JSON.parse(fs.readFileSync(wfPath, "utf8"));

for (const node of wf.nodes) {
  if (node.name === "Extract Deal Data" && node.parameters?.jsCode) {
    let js = node.parameters.jsCode;
    if (!js.includes("const lineItems = props.hs_line_items")) {
      js = js.replace(
        "const launchBalance = remainingTierBalance + tierMonthly;\n\nreturn",
        `const launchBalance = remainingTierBalance + tierMonthly;

const lineItems = props.hs_line_items ? JSON.parse(props.hs_line_items) : [];
const productList = lineItems.map(i => ({ sku: i.hs_sku || '', name: i.name || '', price: money(i.price) }));

return`,
      );
      js = js.replace("    launchBalance,\n    dealId:", "    launchBalance,\n    productList,\n    dealId:");
    }
    node.parameters.jsCode = js;
  }
  if (node.name === "Prep Claude Prompt") {
    node.parameters = node.parameters || {};
    node.parameters.jsCode = PREP_CLAUDE;
  }
}

fs.writeFileSync(wfPath, JSON.stringify(wf, null, 2) + "\n", "utf8");

const byName = Object.fromEntries(wf.nodes.map((x) => [x.name, x]));
function ref(name) {
  return varNameFor(byName[name]);
}

const lines = [];
lines.push(`import { workflow, node, trigger, ifElse } from '@n8n/workflow-sdk';`);
lines.push("");
for (const n of wf.nodes) {
  lines.push(emitNodeFactory(n).code);
}
lines.push("");
lines.push(
  `export default workflow(${JSON.stringify(wf.id)}, ${JSON.stringify(wf.name)})`,
);
const R = ref;
const pollChain = `${R("Wait 30min")}.to(${R("Check Approval Status")}.to(${R("Approved?")}`;
const approvedInner = `.onTrue(${R("Prep Send Email")}.to(${R("Send Contract Email")}.to(${R("Update Deal")}.to(${R("Prep Log")}.to(${R("Log to Sheet")}.to(${R("Track Time Saved")})))))).onFalse(${R("Wait 30min")})))`;
const mainAfterClaude = `${R("Prep Claude Prompt")}.to(${R("Call Claude API")}.to(${R("Parse Claude Response")}.to(${R("Prep Contract PDF")}.to(${R("Call PDF Service")}.to(${R("Ensure PDF Item")}.to(${R("Upload to Drive")}.to(${R("Add to Contracts Queue")}.to(${R("Prep Alert")}.to(${R("Send Alert")}.to(${pollChain}${approvedInner}))))))))))`;

lines.push(`  .add(${R("Note — About this workflow")})`);
lines.push(
  `  .add(${R("Deal Contract Sent Webhook")}.to(${R("Get Config")}.to(${R("Extract Deal Data")}.to(${R("Has Client Drive Folder?")}.onTrue(${mainAfterClaude}).onFalse(${R("Prep Missing Folder Alert")}.to(${R("Send Missing Folder Alert")}))))));`,
);

fs.mkdirSync(path.dirname(outSdk), { recursive: true });
fs.writeFileSync(outSdk, lines.join("\n") + "\n", "utf8");
console.log(JSON.stringify({ wfPath, outSdk, nodes: wf.nodes.length }, null, 2));
