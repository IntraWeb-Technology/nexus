#!/usr/bin/env node
/**
 * Resolve git base/head, run `turbo query affected`, and emit:
 * - GitHub Actions outputs / step summary (when GITHUB_OUTPUT / GITHUB_STEP_SUMMARY set)
 * - JSON to stdout for local use
 *
 * Env:
 *   AFFECTED_BASE, AFFECTED_HEAD — optional explicit SHAs/refs
 *   FORCE_ALL — "true" to mark every known deployable as affected
 *   GITHUB_EVENT_PATH — Actions event payload (optional)
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd());

/** @type {Record<string, { app: string, path: string, dockerfile?: string, deploy: 'vercel' | 'hostinger' | 'none' }>} */
const DEPLOYABLES = {
  "@repo/iw-portal": {
    app: "iw-portal",
    path: "apps/iw-portal",
    deploy: "vercel",
  },
  "@repo/iw-site-q2": {
    app: "iw-site-q2",
    path: "apps/iw-site-q2",
    deploy: "vercel",
  },
  "cms-strapi": {
    app: "cms-strapi",
    path: "apps/cms-strapi",
    dockerfile: "apps/cms-strapi/Dockerfile",
    deploy: "hostinger",
  },
};

const ALL_PACKAGE_HINTS = [
  ...Object.keys(DEPLOYABLES),
  "@repo/strapi-client",
  "@repo/env",
  "@repo/ops",
  "@repo/integrations",
  "@repo/n8n-workflows",
  "@repo/eslint-config",
  "@repo/typescript-config",
];

function run(cmd, args, { allowFail = false } = {}) {
  try {
    return execFileSync(cmd, args, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 20 * 1024 * 1024,
    }).trim();
  } catch (error) {
    if (allowFail) {
      return {
        ok: false,
        stdout: String(error.stdout ?? ""),
        stderr: String(error.stderr ?? ""),
        status: error.status ?? 2,
      };
    }
    throw error;
  }
}

function git(args, opts) {
  return run("git", args, opts);
}

function resolveBaseHead() {
  const envBase = process.env.AFFECTED_BASE?.trim();
  const envHead = process.env.AFFECTED_HEAD?.trim();
  if (envBase && envHead) {
    return { base: envBase, head: envHead, source: "env" };
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath && existsSync(eventPath)) {
    const event = JSON.parse(readFileSync(eventPath, "utf8"));
    if (event.pull_request?.base?.sha && event.pull_request?.head?.sha) {
      return {
        base: event.pull_request.base.sha,
        head: event.pull_request.head.sha,
        source: "pull_request",
      };
    }
    if (event.before && event.after && event.before !== "0000000000000000000000000000000000000000") {
      return { base: event.before, head: event.after, source: "push" };
    }
  }

  const head = git(["rev-parse", "HEAD"]);
  const mergeBase = git(["merge-base", "origin/main", "HEAD"], { allowFail: true });
  if (typeof mergeBase === "string" && mergeBase) {
    return { base: mergeBase, head, source: "merge-base-origin/main" };
  }
  const main = git(["rev-parse", "origin/main"], { allowFail: true });
  if (typeof main === "string" && main) {
    return { base: main, head, source: "origin/main" };
  }
  const parent = git(["rev-parse", "HEAD^"], { allowFail: true });
  if (typeof parent === "string" && parent) {
    return { base: parent, head, source: "HEAD^" };
  }
  return { base: head, head, source: "head-only-fallback", error: true };
}

function changedFiles(base, head) {
  const out = git(["diff", "--name-only", `${base}...${head}`], { allowFail: true });
  if (typeof out !== "string") return [];
  return out.split("\n").map((l) => l.trim()).filter(Boolean);
}

function extractJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in turbo output");
  }
  return JSON.parse(text.slice(start, end + 1));
}

function queryAffected(base, head) {
  const result = run(
    "pnpm",
    [
      "exec",
      "turbo",
      "query",
      "affected",
      `--base=${base}`,
      `--head=${head}`,
      "--packages",
    ],
    { allowFail: true },
  );

  if (typeof result === "string") {
    try {
      return { ok: true, data: extractJson(result) };
    } catch (error) {
      return {
        ok: false,
        error: `Failed to parse turbo query JSON: ${error.message}`,
        raw: result,
      };
    }
  }

  const raw = `${result.stdout}\n${result.stderr}`.trim();
  try {
    const data = extractJson(result.stdout || "");
    if (result.status === 0 || result.status === 1) {
      return { ok: true, data, exitCode: result.status };
    }
  } catch {
    // fall through
  }
  return {
    ok: false,
    error: raw || `turbo query affected failed with status ${result.status}`,
    exitCode: result.status,
  };
}

function affectedPackageItems(data) {
  const root = data?.data?.affectedPackages ?? data?.affectedPackages;
  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.items)) return root.items;
  if (Array.isArray(data?.packages)) return data.packages;
  return [];
}

function reasonToString(reason) {
  if (!reason) return "affected";
  if (typeof reason === "string") return reason;
  if (typeof reason === "object") {
    if (reason.__typename) return reason.__typename;
    if (reason.message) return reason.message;
    try {
      return JSON.stringify(reason);
    } catch {
      return "affected";
    }
  }
  return "affected";
}

function packageNamesFromQuery(data) {
  const names = new Set();
  for (const item of affectedPackageItems(data)) {
    if (typeof item === "string") names.add(item);
    else if (item?.name) names.add(item.name);
    else if (item?.package) names.add(item.package);
  }
  // Root workspace marker is not a runnable package
  names.delete("//");
  return [...names];
}

function reasonsFromQuery(data) {
  /** @type {Record<string, string>} */
  const reasons = {};
  for (const item of affectedPackageItems(data)) {
    if (typeof item === "object" && item?.name) {
      reasons[item.name] = reasonToString(item.reason);
    }
  }
  return reasons;
}

function mapDeployables(affectedPackages, forceAll, detectionFailed) {
  /** @type {Array<{ app: string, path: string, dockerfile: string, deploy: string, package: string, reason: string }>} */
  const selected = [];
  /** @type {Array<{ app: string, path: string, reason: string }>} */
  const skipped = [];

  for (const [pkg, meta] of Object.entries(DEPLOYABLES)) {
    const hit =
      forceAll ||
      detectionFailed ||
      affectedPackages.includes(pkg) ||
      (pkg === "@repo/iw-site-q2" && affectedPackages.includes("@repo/strapi-client")) ||
      (pkg === "@repo/iw-portal" &&
        (affectedPackages.includes("@repo/env") || affectedPackages.includes("@repo/ops")));

    if (hit) {
      let reason = "package affected";
      if (forceAll) reason = "force_all";
      else if (detectionFailed) reason = "detection_failed_fail_closed";
      else if (affectedPackages.includes(pkg)) reason = "direct or transitive turbo affected";
      else if (pkg === "@repo/iw-site-q2") reason = "depends on @repo/strapi-client";
      else reason = "depends on @repo/env or @repo/ops";

      selected.push({
        app: meta.app,
        path: meta.path,
        dockerfile: meta.dockerfile ?? "",
        deploy: meta.deploy,
        package: pkg,
        reason,
      });
    } else {
      skipped.push({
        app: meta.app,
        path: meta.path,
        reason: "not in turbo affected set",
      });
    }
  }

  return { selected, skipped };
}

function writeOutput(key, value) {
  const path = process.env.GITHUB_OUTPUT;
  if (!path) return;
  const str = typeof value === "string" ? value : JSON.stringify(value);
  if (str.includes("\n")) {
    appendFileSync(path, `${key}<<EOF\n${str}\nEOF\n`);
  } else {
    appendFileSync(path, `${key}=${str}\n`);
  }
}

function writeSummary(markdown) {
  const path = process.env.GITHUB_STEP_SUMMARY;
  if (!path) return;
  appendFileSync(path, markdown);
}

function main() {
  const forceAll = process.env.FORCE_ALL === "true";
  const { base, head, source, error: baseError } = resolveBaseHead();
  const files = changedFiles(base, head);

  let detectionFailed = Boolean(baseError);
  let affectedPackages = [];
  /** @type {Record<string, string>} */
  let reasons = {};
  let queryError = "";

  if (forceAll) {
    affectedPackages = [...ALL_PACKAGE_HINTS];
    reasons = Object.fromEntries(affectedPackages.map((p) => [p, "force_all"]));
  } else {
    const query = queryAffected(base, head);
    if (!query.ok) {
      detectionFailed = true;
      queryError = query.error || "unknown query error";
      affectedPackages = [...ALL_PACKAGE_HINTS];
      reasons = Object.fromEntries(
        affectedPackages.map((p) => [p, "detection_failed_fail_closed"]),
      );
    } else {
      affectedPackages = packageNamesFromQuery(query.data);
      reasons = reasonsFromQuery(query.data);
    }
  }

  const { selected, skipped } = mapDeployables(
    affectedPackages,
    forceAll,
    detectionFailed,
  );

  const validateFilter = forceAll || detectionFailed
    ? "__ALL__"
    : affectedPackages.length > 0
      ? affectedPackages.join("\n")
      : "__NONE__";

  const dockerApps = selected.filter((s) => s.dockerfile);
  const deployApps = selected.filter((s) => s.deploy !== "none");

  const result = {
    base,
    head,
    source,
    forceAll,
    detectionFailed,
    queryError: queryError || undefined,
    changedFileCount: files.length,
    changedFiles: files.slice(0, 200),
    affectedPackages,
    reasons,
    apps: {
      selected,
      skipped,
    },
    matrices: {
      docker: { include: dockerApps },
      deploy: { include: deployApps },
    },
  };

  writeOutput("base_sha", base);
  writeOutput("head_sha", head);
  writeOutput("source", source);
  writeOutput("force_all", String(forceAll));
  writeOutput("detection_failed", String(detectionFailed));
  writeOutput("has_work", String(forceAll || detectionFailed || affectedPackages.length > 0));
  writeOutput("validate_filter", validateFilter);
  writeOutput("affected_packages_json", JSON.stringify(affectedPackages));
  writeOutput("selected_apps_json", JSON.stringify(selected));
  writeOutput("skipped_apps_json", JSON.stringify(skipped));
  writeOutput("docker_matrix", JSON.stringify({ include: dockerApps.length ? dockerApps : [{ app: "__skip__", path: "", dockerfile: "", deploy: "none", package: "", reason: "none" }] }));
  writeOutput("deploy_matrix", JSON.stringify({ include: deployApps.length ? deployApps : [{ app: "__skip__", path: "", dockerfile: "", deploy: "none", package: "", reason: "none" }] }));
  writeOutput("result_json", JSON.stringify(result));

  if (process.env.GITHUB_WORKSPACE) {
    writeFileSync(
      resolve(process.env.GITHUB_WORKSPACE, "affected-result.json"),
      `${JSON.stringify(result, null, 2)}\n`,
    );
  }

  const summary = [
    "## Affected package detection",
    "",
    `| Field | Value |`,
    `| --- | --- |`,
    `| Base SHA | \`${base}\` |`,
    `| Head SHA | \`${head}\` |`,
    `| Source | ${source} |`,
    `| Force all | ${forceAll} |`,
    `| Detection failed | ${detectionFailed} |`,
    `| Changed files | ${files.length} |`,
    `| Affected packages | ${affectedPackages.length} |`,
    "",
    "### Affected packages",
    "",
    affectedPackages.length
      ? affectedPackages.map((p) => `- \`${p}\`${reasons[p] ? ` — ${reasons[p]}` : ""}`).join("\n")
      : "_None_",
    "",
    "### Applications selected",
    "",
    selected.length
      ? selected.map((a) => `- **${a.app}** (\`${a.package}\`) — ${a.reason}`).join("\n")
      : "_None_",
    "",
    "### Applications skipped",
    "",
    skipped.length
      ? skipped.map((a) => `- **${a.app}** — ${a.reason}`).join("\n")
      : "_None_",
    "",
    queryError ? `### Query error\n\n\`\`\`\n${queryError}\n\`\`\`\n` : "",
    "### Changed files (truncated)",
    "",
    "```",
    ...(files.slice(0, 80).length ? files.slice(0, 80) : ["(none)"]),
    files.length > 80 ? `… +${files.length - 80} more` : "",
    "```",
    "",
  ].join("\n");

  writeSummary(summary);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

  if (detectionFailed && process.env.FAIL_ON_DETECTION_ERROR === "true") {
    process.exit(2);
  }
}

main();
