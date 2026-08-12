import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendContactEmail } from "@/lib/contact-email";
import {
  contactFormSchema,
  fieldErrorsFromZod,
} from "@/lib/contact-validation";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const LIMIT_PER_IP = 5;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Validation failed",
        fields: fieldErrorsFromZod(parsed.error),
      },
      { status: 400 },
    );
  }

  const { name, email, message, company } = parsed.data;

  // Honeypot filled → pretend success (do not tip off bots).
  if (company && company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const ip = clientIp(request);
  const limited = checkRateLimit(`contact:${ip}`, LIMIT_PER_IP, WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many requests. Please try again later.",
        fields: {
          form: "Too many requests. Please try again later.",
        },
      },
      {
        status: 429,
        headers: limited.retryAfterSec
          ? { "Retry-After": String(limited.retryAfterSec) }
          : undefined,
      },
    );
  }

  // Test / local without credentials: allow an explicit insecure skip.
  if (
    process.env.CONTACT_INSECURE_SKIP_SEND === "true" ||
    process.env.NODE_ENV === "test"
  ) {
    return NextResponse.json({ ok: true });
  }

  if (!process.env.RESEND_API_KEY?.trim() || !process.env.CONTACT_EMAIL?.trim()) {
    // Missing credentials — fail gracefully rather than throw at runtime.
    console.error(
      "[atlas-contact] RESEND_API_KEY or CONTACT_EMAIL is not configured",
    );
    return NextResponse.json(
      {
        ok: false,
        error: "Delivery is temporarily unavailable.",
        fields: { form: "Delivery is temporarily unavailable." },
      },
      { status: 503 },
    );
  }

  const result = await sendContactEmail({ name, email, message });
  if (!result.ok) {
    console.error("[atlas-contact] send failed:", result.error);
    return NextResponse.json(
      {
        ok: false,
        error: "Delivery failed.",
        fields: { form: "Delivery failed. Please try again." },
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
