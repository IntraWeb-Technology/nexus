import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { NextRequest } from "next/server";

function recaptchaMinScore(): number {
  const raw = process.env.RECAPTCHA_MIN_SCORE?.trim();
  if (!raw) return 0.5;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

export async function verifyRecaptchaEnterprise(
  token: string,
  request: NextRequest,
  expectedAction: string,
): Promise<{ valid: boolean; score?: number; invalidReason?: string }> {
  const projectId = process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID;
  const siteKey = process.env.RECAPTCHA_ENTERPRISE_SITE_KEY;
  if (!projectId || !siteKey) return { valid: false, invalidReason: "not_configured" };

  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentialsJson?.trim()) {
    return { valid: false, invalidReason: "api_error" };
  }

  try {
    const key = JSON.parse(credentialsJson) as { client_email?: string; private_key?: string };
    if (!key.client_email || !key.private_key) {
      return { valid: false, invalidReason: "api_error" };
    }
    const privateKey = key.private_key.includes("\\n")
      ? key.private_key.replace(/\\n/g, "\n")
      : key.private_key;
    const credsPath = join(tmpdir(), "gcp-recaptcha-creds.json");
    mkdirSync(tmpdir(), { recursive: true });
    writeFileSync(credsPath, JSON.stringify({ ...key, private_key: privateKey }), "utf8");

    const prevPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credsPath;
    try {
      const client = new RecaptchaEnterpriseServiceClient();
      const projectPath = client.projectPath(projectId);
      const forwarded = request.headers.get("x-forwarded-for");
      const userIp = forwarded ? forwarded.split(",")[0].trim() : "";
      const [response] = await client.createAssessment({
        parent: projectPath,
        assessment: {
          event: {
            token,
            siteKey,
            expectedAction,
            userAgent: request.headers.get("user-agent") ?? undefined,
            userIpAddress: userIp || undefined,
          },
        },
      });

      if (!response.tokenProperties?.valid) {
        return { valid: false, invalidReason: String(response.tokenProperties?.invalidReason ?? "invalid") };
      }
      if (response.tokenProperties.action !== expectedAction) {
        return { valid: false, invalidReason: "action_mismatch" };
      }
      const score = response.riskAnalysis?.score ?? 0;
      const scoreOk = score >= recaptchaMinScore();
      return { valid: scoreOk, score, invalidReason: scoreOk ? undefined : "score_below_threshold" };
    } finally {
      if (prevPath !== undefined) process.env.GOOGLE_APPLICATION_CREDENTIALS = prevPath;
      else delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    }
  } catch {
    return { valid: false, invalidReason: "api_error" };
  }
}
