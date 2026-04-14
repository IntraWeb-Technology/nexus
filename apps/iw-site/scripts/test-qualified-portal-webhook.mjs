/**
 * Activate and POST a test payload to SYS 03 — Qualified to Buy → Portal + Clerk.
 *
 *   node scripts/test-qualified-portal-webhook.mjs
 *   node scripts/test-qualified-portal-webhook.mjs --no-activate
 *
 * Env:
 *   N8N_API_KEY (or ~/.cursor/mcp.json)
 *   N8N_API_URL (default https://n8n.intrawebtech.com)
 *   QUALIFIED_WORKFLOW_ID (default jERY0wN0aZ5kpOAR)
 *   HUBSPOT_TEST_DEAL_ID — HubSpot deal object id for GET CRM (default 99999999999 = expect HubSpot 404 after auth)
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
const workflowId = (process.env.QUALIFIED_WORKFLOW_ID || "jERY0wN0aZ5kpOAR").trim();
const webhookPath = "hubspot-deal-qualified-portal";
const testDealId = (process.env.HUBSPOT_TEST_DEAL_ID || "99999999999").trim();

function isHubSpotDealNotFound(err) {
  if (!err || typeof err !== "object") return false;
  const code = err.httpCode;
  if (code === "404" || code === 404) return true;
  const msg = String(err.message || "");
  if (msg.includes("could not be found")) return true;
  const messages = err.messages;
  if (Array.isArray(messages) && messages.some((m) => String(m).includes("404"))) return true;
  return false;
}

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
    id: testDealId,
    properties: {
      dealname: "Repo smoke test",
      contact_email: "smoke-test@example.com",
      contact_firstname: "Smoke",
      contact_lastname: "Test",
      tier: "starter",
    },
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
    console.log("\nOK: webhook returned success (check n8n execution for provision + Clerk steps).");
    process.exit(0);
  }

  const exUrl = new URL(`${baseUrl}/api/v1/executions`);
  exUrl.searchParams.set("workflowId", workflowId);
  exUrl.searchParams.set("limit", "1");
  const exRes = await fetch(exUrl.toString(), { headers: { "X-N8N-API-KEY": apiKey, accept: "application/json" } });
  const exJson = await exRes.json().catch(() => ({}));
  const first = exJson?.data?.[0];
  if (!first?.id) {
    console.error("No execution found to inspect.");
    process.exit(1);
  }

  const detRes = await fetch(`${baseUrl}/api/v1/executions/${first.id}?includeData=true`, {
    headers: { "X-N8N-API-KEY": apiKey, accept: "application/json" },
  });
  const detText = await detRes.text();
  let err;
  try {
    const det = JSON.parse(detText);
    err = det?.data?.resultData?.error;
  } catch {
    /* ignore */
  }

  if (hookRes.status === 500 && isHubSpotDealNotFound(err)) {
    console.log(
      "\nSmoke OK: workflow is active, CONFIG + HubSpot App Token auth work; HubSpot returned 404 for deal id",
      JSON.stringify(testDealId),
      "(expected for a fake id). Set HUBSPOT_TEST_DEAL_ID to a real portal-linked deal for an end-to-end run.",
    );
    process.exit(0);
  }

  console.error("\nExecution error (first 1200 chars):", detText.slice(0, 1200));
  process.exit(1);
}

main().catch((e) => {
  console.error(e?.stack || String(e));
  process.exit(1);
});
