import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import type { NextRequest } from "next/server";
import {
  buildVerificationUrl,
  generateVerificationToken,
  getDataDeletionSecret,
  hashVerificationToken,
} from "@/lib/data-deletion";
import { escapeHtml, wrapIntraWebStaffEmailHtml } from "@/lib/emailShell";
import { checkRateLimit } from "@/lib/kickoffRateLimit";
import { verifyRecaptchaEnterprise } from "@/lib/recaptcha-enterprise";
import { createSiteServiceSupabase } from "@/lib/supabase-service";
import { privacyEmail } from "@/lib/site";

export const maxDuration = 60;

const RECAPTCHA_ACTION = "data_deletion";

const formSchema = z.object({
  email: z.string().email(),
  requestType: z.enum(["delete_personal_data", "marketing_opt_out", "access_copy"]),
  note: z.string().max(2000).optional(),
  recaptchaToken: z.string().optional(),
});

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}

export async function POST(request: NextRequest) {
  try {
    if (!getDataDeletionSecret()) {
      return NextResponse.json({ error: "Data deletion is not configured" }, { status: 503 });
    }

    const body = formSchema.parse(await request.json());
    const email = body.email.trim().toLowerCase();
    const ip = clientIp(request);

    const emailLimit = checkRateLimit(`data-deletion:email:${email}`, 3, 60 * 60 * 1000);
    if (!emailLimit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(emailLimit.retryAfterSec ?? 3600) } },
      );
    }
    const ipLimit = checkRateLimit(`data-deletion:ip:${ip}`, 10, 60 * 60 * 1000);
    if (!ipLimit.ok) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const skipRecaptcha =
      process.env.NODE_ENV === "development" && process.env.RECAPTCHA_SKIP_IN_DEV === "true";

    if (!skipRecaptcha) {
      const token = body.recaptchaToken;
      if (!token) {
        return NextResponse.json({ error: "Security verification required" }, { status: 400 });
      }
      const recaptcha = await verifyRecaptchaEnterprise(token, request, RECAPTCHA_ACTION);
      if (!recaptcha.valid) {
        return NextResponse.json({ error: "Security verification failed" }, { status: 400 });
      }
    }

    const supabase = createSiteServiceSupabase();
    const requestId = crypto.randomUUID();
    const verificationToken = generateVerificationToken(requestId, email);

    const { error: insertError } = await supabase.from("data_subject_requests").insert({
      id: requestId,
      email,
      request_type: body.requestType,
      status: "pending_verification",
      note: body.note?.trim() || null,
      verification_token_hash: hashVerificationToken(verificationToken),
      source_ip: ip === "unknown" ? null : ip,
    });

    if (insertError) {
      console.error("[data-deletion] insert failed", insertError);
      return NextResponse.json({ error: "Could not save request" }, { status: 500 });
    }

    const confirmUrl = buildVerificationUrl(requestId, email, verificationToken);
    const resend = getResend();
    const from = process.env.RESEND_FROM?.trim() || "IntraWeb <noreply@intrawebtech.com>";

    await resend.emails.send({
      from,
      to: email,
      subject: "Confirm your data request — IntraWeb Technologies",
      html: wrapIntraWebStaffEmailHtml(`
        <p>We received a request regarding your personal data at IntraWeb Technologies.</p>
        <p><strong>Request type:</strong> ${escapeHtml(body.requestType.replace(/_/g, " "))}</p>
        <p>Click the link below to confirm this request. It expires in 72 hours.</p>
        <p><a href="${escapeHtml(confirmUrl)}">Confirm data request</a></p>
        <p>If you did not make this request, you can ignore this email or contact
        <a href="mailto:${escapeHtml(privacyEmail)}">${escapeHtml(privacyEmail)}</a>.</p>
      `),
    });

    return NextResponse.json({ ok: true, message: "Check your email to confirm this request." });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }
    console.error("[data-deletion] request error", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
