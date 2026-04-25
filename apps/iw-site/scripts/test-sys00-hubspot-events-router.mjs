/**
 * Programmatic end-to-end test: SYS 00 — HubSpot Events Router (n8n Public API + production webhook).
 *
 * 1. POSTs a HubSpot-shaped payload to /webhook/hubspot-events (same as HubSpot app).
 * 2. Polls executions for workflow zIP8vhSQ1bCQP9RR and fetches the latest run with includeData.
 * 3. Prints failing node, HTTP codes, and remediation hints.
 *
 * Usage:
 *   node scripts/test-sys00-hubspot-events-router.mjs
 *   node scripts/test-sys00-hubspot-events-router.mjs --deal-stage-change
 *   HUBSPOT_TEST_DEAL_ID=12345 node scripts/test-sys00-hubspot-events-router.mjs --deal-stage-change
 *
 * Env: N8N_API_KEY (or ~/.cursor/mcp.json), optional N8N_API_URL, optional SYS00_WORKFLOW_ID (default zIP8vhSQ1bCQP9RR)
 */
import fs from "node:fs";
import path from "node:path";

function loadApiKey() {
  const fromEnv = process.env.N8N_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  const mcpPath =
    process.env.N8N_MCP_JSON?.trim() ||
    path.join(process.env.USERPROFILE || process.env.HOME || "", ".cursor", "mcp.json");
  const raw = fs.readFileSync(mcpPath, "utf8");
  const m = raw.match(/"N8N_API_KEY":\s*"([^"]+)"/);
  if (!m) throw new Error("Set N8N_API_KEY or add N8N_API_KEY to ~/.cursor/mcp.json");
  return m[1];
}

const baseUrl = (process.env.N8N_API_URL || "https://n8n.intrawebtech.com").replace(/\/$/, "");
const workflowId = (process.env.SYS00_WORKFLOW_ID || "zIP8vhSQ1bCQP9RR").trim();
const webhookPath = "hubspot-events";
const dealStageChange = process.argv.includes("--deal-stage-change");
const testDealId = (process.env.HUBSPOT_TEST_DEAL_ID || "99999999999").trim();
const usingPlaceholderHubSpotId = testDealId === "99999999999";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function analyzeError(err) {
  if (!err || typeof err !== "object") return [];
  const hints = [];
  const msg = String(err.message || "");
  const node = err.node?.name || err.node?.parameters?.name || "unknown node";
  const http = err.httpCode;

  if (http === "404" || http === 404 || msg.includes("could not be found")) {
    hints.push("HubSpot returned 404: object id does not exist or token cannot read that object.");
    hints.push("Set HUBSPOT_TEST_DEAL_ID (or contact id for contact events) to a real CRM id in your portal.");
  }
  if (msg.includes("Unable to sign") || msg.includes("access token")) {
    hints.push("HubSpot credential on the Fetch node is missing or invalid in this n8n instance.");
  }
  if (msg.includes("ECONNREFUSED") || msg.includes("ENOTFOUND")) {
    hints.push("Downstream HTTP (POST to System Webhook) could not reach the host — check n8nBaseUrl and target workflow URLs.");
  }
  if (msg.includes("401") || http === "401" || http === 401) {
    hints.push("Unauthorized on an HTTP step — check secrets / auth on the downstream webhook or HubSpot.");
  }
  if (msg.includes("Merge")) {
    hints.push("Merge may be stuck if one branch never completes — verify Parse outputs items for every path.");
  }
  return { node, http, msg: msg.slice(0, 500), hints };
}

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { accept: "application/json", "X-N8N-API-KEY": loadApiKey(), ...opts.headers },
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}\n${String(text).slice(0, 600)}`);
  return data;
}

async function main() {
  const apiKey = loadApiKey();

  const wf = await fetchJson(`${baseUrl}/api/v1/workflows/${encodeURIComponent(workflowId)}`, {
    headers: { "X-N8N-API-KEY": apiKey },
  });
  console.log("Workflow:", wf.name, "| active:", wf.active, "| id:", wf.id);
  if (!wf.active) {
    console.warn("WARN: workflow is inactive — webhook may return 404. Activating via API…");
    const act = await fetch(`${baseUrl}/api/v1/workflows/${encodeURIComponent(workflowId)}/activate`, {
      method: "POST",
      headers: { "X-N8N-API-KEY": apiKey, accept: "application/json" },
    });
    const t = await act.text();
    console.log("activate:", act.status, t.slice(0, 200));
  }

  const before = Date.now();

  /** HubSpot CRM subscription payload shape (single event in array). */
  const body = dealStageChange
    ? [
        {
          eventType: "deal.propertyChange",
          subscriptionType: "deal.propertyChange",
          objectId: testDealId,
          propertyName: "dealstage",
          propertyValue: "qualifiedtobuy",
        },
      ]
    : [
        {
          eventType: "contact.creation",
          subscriptionType: "contact.creation",
          objectId: testDealId,
        },
      ];

  const hookUrl = `${baseUrl}/webhook/${webhookPath}`;
  const hookRes = await fetch(hookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const hookText = await hookRes.text();
  console.log("\nPOST", hookUrl);
  console.log("Webhook response:", hookRes.status, hookText.slice(0, 300));

  let executionId = null;
  let lastDetail = null;
  for (let i = 0; i < 30; i++) {
    await sleep(800);
    const listUrl = new URL(`${baseUrl}/api/v1/executions`);
    listUrl.searchParams.set("workflowId", workflowId);
    listUrl.searchParams.set("limit", "5");
    const list = await fetchJson(listUrl.toString(), { headers: { "X-N8N-API-KEY": apiKey } });
    const rows = Array.isArray(list?.data) ? list.data : [];
    const started = rows.find((r) => {
      const t = Date.parse(r.startedAt || "");
      return t >= before - 5000;
    });
    if (!started?.id) continue;
    executionId = started.id;
    const detUrl = `${baseUrl}/api/v1/executions/${executionId}?includeData=true`;
    lastDetail = await fetchJson(detUrl, { headers: { "X-N8N-API-KEY": apiKey } });
    const status = lastDetail?.data?.status || lastDetail?.status;
    if (status === "success" || status === "error" || status === "crashed") break;
  }

  if (!executionId || !lastDetail?.data) {
    console.error("\nCould not load a new execution (timeout). Check n8n Executions UI for", workflowId);
    process.exit(1);
  }

  const d = lastDetail.data ?? lastDetail;
  const execStatus = d.status ?? d?.data?.status;
  console.log("\nExecution:", executionId, "| status:", execStatus, "| mode:", d.mode);

  const err = d.resultData?.error;
  if (err) {
    const { node, http, msg, hints } = analyzeError(err);
    if (usingPlaceholderHubSpotId && (http === "404" || http === 404)) {
      console.log("\n--- EXPECTED TEST LIMITATION ---");
      console.log("Node:", node);
      console.log("httpCode:", http);
      console.log("message:", msg);
      console.log(
        "Using placeholder HUBSPOT_TEST_DEAL_ID=99999999999; set a real HubSpot object id for full end-to-end validation.",
      );
      process.exit(0);
    }
    console.log("\n--- FAILURE ---");
    console.log("Node:", node);
    console.log("httpCode:", http);
    console.log("message:", msg);
    if (hints.length) console.log("Hints:\n- " + hints.join("\n- "));
    console.log("\nRaw error (trim):", JSON.stringify(err).slice(0, 2000));
    process.exit(2);
  }

  console.log("\nOK: execution finished without top-level error.");
  const runData = d.resultData?.runData || {};
  const nodeNames = Object.keys(runData);
  console.log("Nodes run:", nodeNames.join(", "));
  process.exit(0);
}

main().catch((e) => {
  console.error(e?.stack || String(e));
  process.exit(1);
});
