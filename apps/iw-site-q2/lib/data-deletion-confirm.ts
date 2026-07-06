import {
  getDataDeletionSecret,
  hashVerificationToken,
  isRequestExpired,
  verifyVerificationToken,
} from "@/lib/data-deletion";
import { createSiteServiceSupabase } from "@/lib/supabase-service";
import { privacyEmail } from "@/lib/site";

async function dispatchToN8n(requestId: string, email: string): Promise<boolean> {
  const n8nUrl =
    process.env.N8N_DATA_DELETION_WEBHOOK_URL?.trim() ||
    (process.env.N8N_BASE_URL?.replace(/\/$/, "")
      ? `${process.env.N8N_BASE_URL.replace(/\/$/, "")}/webhook/data-deletion-confirmed`
      : "");

  if (!n8nUrl) {
    console.error("[data-deletion] N8N_DATA_DELETION_WEBHOOK_URL not set");
    return false;
  }

  const secret =
    process.env.MARKETING_N8N_WEBHOOK_SECRET?.trim() ||
    process.env.N8N_WEBHOOK_SECRET?.trim() ||
    process.env.WEBHOOK_SECRET?.trim();

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (secret) {
    const headerName =
      process.env.MARKETING_N8N_WEBHOOK_SECRET_HEADER?.trim() ||
      process.env.N8N_WEBHOOK_SECRET_HEADER?.trim() ||
      "x-intrawebtech-secret";
    headers[headerName] = secret;
  }

  const res = await fetch(n8nUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ request_id: requestId, email }),
    signal: AbortSignal.timeout(30_000),
  });
  return res.ok;
}

export async function confirmDataDeletionRequest(input: {
  requestId: string;
  email: string;
  token: string;
}): Promise<{ ok: boolean; title: string; message: string }> {
  if (!getDataDeletionSecret()) {
    return {
      ok: false,
      title: "Not available",
      message: "Data deletion is not configured. Please contact us directly.",
    };
  }

  const email = input.email.trim().toLowerCase();
  const requestId = input.requestId.trim();
  const token = input.token.trim();

  if (!verifyVerificationToken(requestId, email, token)) {
    return {
      ok: false,
      title: "Invalid link",
      message: "This confirmation link is invalid or has already been used.",
    };
  }

  const supabase = createSiteServiceSupabase();
  const { data: row, error } = await supabase
    .from("data_subject_requests")
    .select("id, email, status, verification_token_hash, created_at")
    .eq("id", requestId)
    .maybeSingle();

  if (error || !row) {
    return { ok: false, title: "Request not found", message: "We could not find this data request." };
  }

  if (row.email.toLowerCase() !== email) {
    return { ok: false, title: "Invalid link", message: "This confirmation link does not match our records." };
  }

  if (isRequestExpired(row.created_at)) {
    return {
      ok: false,
      title: "Link expired",
      message: "This confirmation link has expired. Please submit a new request.",
    };
  }

  if (row.verification_token_hash !== hashVerificationToken(token)) {
    return { ok: false, title: "Invalid link", message: "This confirmation link is invalid." };
  }

  if (row.status !== "pending_verification") {
    return {
      ok: true,
      title: "Already confirmed",
      message: "This request was already confirmed. We will email you when processing is complete.",
    };
  }

  await supabase
    .from("data_subject_requests")
    .update({ status: "verified", verified_at: new Date().toISOString() })
    .eq("id", requestId);

  const dispatched = await dispatchToN8n(requestId, email);
  if (!dispatched) {
    return {
      ok: false,
      title: "Processing delayed",
      message: `Your request was confirmed but automation could not start. Please contact ${privacyEmail}.`,
    };
  }

  return {
    ok: true,
    title: "Request confirmed",
    message:
      "We are processing your data request. You will receive an email when it is complete. This may take up to 30 days for complex requests.",
  };
}
