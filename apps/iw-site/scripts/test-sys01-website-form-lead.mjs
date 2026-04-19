/**
 * POST a smoke payload to SYS 01 — Website Form Lead Intake webhook.
 *
 *   pnpm --filter @repo/iw-site exec node scripts/test-sys01-website-form-lead.mjs
 *   node scripts/test-sys01-website-form-lead.mjs --no-activate
 *
 * Env:
 *   N8N_API_KEY (or ~/.cursor/mcp.json)
 *   N8N_API_URL (default https://n8n.intrawebtech.com)
 *   SYS01_WEBSITE_FORM_WORKFLOW_ID (default JzghCkfPxT5CV1iT from repo export)
 *   N8N_SYS01_TEST_CONTACT_ID — HubSpot contact id (optional; fake id may yield HubSpot errors inside n8n)
 */
import fs from "node:fs";
import path from "node:path";

const noActivate = process.argv.includes("--no-activate");

function loadApiKey() {
  const fromEnv = process.env.N8N_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  const mcpPath =
    process.env.N8N_MCP_JSON?.trim() ||
    path.join(process.env.USERPROFILE || process.env.HOME || "", ".cursor", "mcp.json");
  const raw = fs.readFileSync(mcpPath, "utf8");
  const m = raw.match(/"N8N_API_KEY":\s*"([^"]+)"/);
  if (m) return m[1];
  throw new Error("Set N8N_API_KEY or add N8N_API_KEY to ~/.cursor/mcp.json");
}

const baseUrl = (process.env.N8N_API_URL || "https://n8n.intrawebtech.com").replace(/\/$/, "");
const workflowId = (process.env.SYS01_WEBSITE_FORM_WORKFLOW_ID || "JzghCkfPxT5CV1iT").trim();
const webhookPath = "hubspot-website-form-lead";
const testContactId = (process.env.N8N_SYS01_TEST_CONTACT_ID || "999888777666").trim();

async function main() {
  const apiKey = loadApiKey();

  const getRes = await fetch(`${baseUrl}/api/v1/workflows/${encodeURIComponent(workflowId)}`, {
    headers: { "X-N8N-API-KEY": apiKey, accept: "application/json" },
  });
  const getText = await getRes.text();
  if (!getRes.ok) {
    console.error("GET workflow failed", getRes.status, getText.slice(0, 600));
    process.exit(1);
  }

  if (!noActivate) {
    const actRes = await fetch(
      `${baseUrl}/api/v1/workflows/${encodeURIComponent(workflowId)}/activate`,
      { method: "POST", headers: { "X-N8N-API-KEY": apiKey, accept: "application/json" } },
    );
    const actText = await actRes.text();
    console.log("POST .../activate:", actRes.status, actText.slice(0, 200));
    if (!actRes.ok) {
      console.error(actText.slice(0, 800));
      process.exit(1);
    }
  }

  const payload = {
    contactId: testContactId,
    createDeal: true,
    dealStage: "appointmentscheduled",
    tier: "starter",
    painOverride: "",
  };

  const hookUrl = `${baseUrl}/webhook/${webhookPath}`;
  const hookRes = await fetch(hookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const hookText = await hookRes.text();
  console.log("POST webhook:", hookRes.status, hookText.slice(0, 500));

  if (hookRes.ok) {
    console.log("\nOK: SYS 01 webhook returned success (inspect n8n execution for HubSpot nodes).");
    process.exit(0);
  }

  console.error("\nWebhook non-OK. Inspect last execution in n8n UI or lower API limit query.");
  process.exit(1);
}

main().catch((e) => {
  console.error(e?.stack || String(e));
  process.exit(1);
});
