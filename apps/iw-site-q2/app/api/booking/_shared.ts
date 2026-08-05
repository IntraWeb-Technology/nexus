// apps/iw-site-q2/app/api/booking/_shared.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { fetchAvailableSlots, createCalBooking } from "@/lib/calcomApi";
import { type BookingFlow, resolveEventType } from "@/lib/bookingFlow";
import { verifyKickoffBookingSession, getKickoffBookingSecret } from "@/lib/kickoffBookingSession";
import { hubspotSyncKickoffBooking } from "@/lib/hubspotKickoffBooking";
import { checkRateLimit } from "@/lib/kickoffRateLimit";
import { rangeUtcFromAnchor } from "@/lib/kickoffSlotRange";

const flowSchema = z.enum(["kickoff", "diagnostic"]);

const slotsQuerySchema = z.object({
  anchorDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeZone: z.string().min(2).max(120),
  spanDays: z.coerce.number().int().min(1).max(35).optional().default(7),
  flow: flowSchema.optional(),
  bookingSession: z.string().optional(),
});

const bookBodySchema = z.object({
  bookingSession: z.string().min(10),
  start: z.string().min(10),
  timeZone: z.string().min(2).max(120),
  kickoffTitle: z.string().max(500).optional(),
});

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

function managementUrlFromUid(uid: string): string {
  const base = (process.env.CAL_BOOKING_MANAGE_URL_BASE || "https://cal.com/booking").replace(/\/+$/, "");
  return `${base}/${encodeURIComponent(uid)}`;
}

/** Reject only structurally invalid JWT-shaped tokens; full verify happens on book. */
function isMalformedBookingSession(token: string): boolean {
  if (token.length < 10) return true;
  const parts = token.split(".");
  return parts.length !== 3 || parts.some((p) => !p);
}

function readOptionalBookingSession(req: NextRequest, sp: URLSearchParams): string | null {
  const fromQuery = sp.get("bookingSession")?.trim();
  if (fromQuery) return fromQuery;
  const fromHeader = req.headers.get("x-booking-session")?.trim();
  if (fromHeader) return fromHeader;
  return null;
}

function resolveFlow(flowOverride: BookingFlow | undefined, fromQuery: string | null | undefined): BookingFlow {
  if (flowOverride) return flowOverride;
  const parsed = flowSchema.safeParse(fromQuery);
  return parsed.success ? parsed.data : "kickoff";
}

function bookingSource(flow: BookingFlow): string {
  return flow === "diagnostic" ? "contact_diagnostic" : "website_intake_kickoff";
}

function defaultBookingTitle(flow: BookingFlow, claims: { company: string; email: string }): string {
  const label = flow === "diagnostic" ? "diagnostic call" : "kickoff";
  return `${claims.company || claims.email} ${label}`;
}

function n8nWebhookForFlow(flow: BookingFlow): string | undefined {
  if (flow === "diagnostic") {
    return process.env.N8N_DIAGNOSTIC_BOOKED_WEBHOOK_URL?.trim();
  }
  return process.env.N8N_KICKOFF_BOOKED_WEBHOOK_URL?.trim();
}

function n8nEventType(flow: BookingFlow): string {
  return flow === "diagnostic" ? "diagnostic_booked" : "kickoff_booked";
}

export async function handleSlots(req: NextRequest, flowOverride?: BookingFlow) {
  const ip = clientIp(req);
  const sp = req.nextUrl.searchParams;
  const flow = resolveFlow(flowOverride, sp.get("flow"));

  const rl = checkRateLimit(`${flow}-slots:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests", retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec ?? 60) } },
    );
  }

  const sessionToken = readOptionalBookingSession(req, sp);
  if (sessionToken && isMalformedBookingSession(sessionToken)) {
    return NextResponse.json({ error: "Invalid booking session token" }, { status: 400 });
  }

  const parsed = slotsQuerySchema.safeParse({
    anchorDate: sp.get("anchorDate"),
    timeZone: sp.get("timeZone"),
    spanDays: sp.get("spanDays") ?? undefined,
    flow: sp.get("flow") ?? undefined,
    bookingSession: sessionToken ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query", detail: parsed.error.flatten() }, { status: 400 });
  }

  let startUtc: string;
  let endUtc: string;
  try {
    const r = rangeUtcFromAnchor(parsed.data.anchorDate, parsed.data.timeZone, parsed.data.spanDays);
    startUtc = r.startUtc;
    endUtc = r.endUtc;
  } catch {
    return NextResponse.json({ error: "Invalid anchor date or time zone" }, { status: 400 });
  }

  const event = resolveEventType(flow);
  if (!event) {
    return NextResponse.json({ error: "Could not resolve Cal event type for this flow" }, { status: 503 });
  }

  const result = await fetchAvailableSlots({
    start: startUtc,
    end: endUtc,
    timeZone: parsed.data.timeZone,
    format: "range",
    event,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status && result.status < 500 ? result.status : 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    range: { startUtc, endUtc },
    slots: result.slots,
  });
}

export async function handleBook(req: NextRequest, defaultFlow: BookingFlow) {
  const ip = clientIp(req);

  const secret = getKickoffBookingSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "Kickoff booking is not configured (missing KICKOFF_BOOKING_JWT_SECRET)" },
      { status: 503 },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bookBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", detail: parsed.error.flatten() }, { status: 400 });
  }

  const claims = verifyKickoffBookingSession(parsed.data.bookingSession, secret);
  if (!claims) {
    return NextResponse.json({ error: "Invalid or expired booking session" }, { status: 401 });
  }

  const flow: BookingFlow = claims.flow ?? defaultFlow;

  const rl = checkRateLimit(`${flow}-book:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests", retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec ?? 60) } },
    );
  }

  let startDate: Date;
  try {
    startDate = new Date(parsed.data.start);
    if (Number.isNaN(startDate.getTime())) {
      throw new Error("bad");
    }
  } catch {
    return NextResponse.json({ error: "Invalid start time" }, { status: 400 });
  }

  const startUtc = startDate.toISOString();
  const event = resolveEventType(flow);
  if (!event) {
    return NextResponse.json({ error: "Could not resolve Cal event type for this flow" }, { status: 503 });
  }

  const meta: Record<string, string> = {
    hubspotContactId: claims.sub,
    source: bookingSource(flow),
  };
  if (claims.dealId) {
    meta.hubspotDealId = claims.dealId;
  }

  const cal = await createCalBooking({
    startUtc,
    attendee: {
      name: `${claims.firstName} ${claims.lastName}`.trim() || claims.email,
      email: claims.email.toLowerCase(),
      timeZone: parsed.data.timeZone,
      ...(claims.phone?.trim() ? { phoneNumber: claims.phone.trim() } : {}),
    },
    title: parsed.data.kickoffTitle?.trim() || defaultBookingTitle(flow, claims),
    metadata: meta,
    event,
  });

  if (!cal.ok) {
    return NextResponse.json(
      { error: cal.error || "Could not create booking" },
      { status: cal.status && cal.status < 500 ? cal.status : 502 },
    );
  }

  const managementUrl = managementUrlFromUid(cal.uid);

  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN?.trim();
  let hubspotErrors: string[] = [];
  if (hubspotToken) {
    const sync = await hubspotSyncKickoffBooking(hubspotToken, {
      contactId: claims.sub,
      dealId: claims.dealId,
      meetingStart: cal.start,
      calBookingUid: cal.uid,
      managementUrl,
    });
    hubspotErrors = sync.errors;
    if (hubspotErrors.length) {
      console.error(`[booking/book] HubSpot sync warnings (${flow}):`, hubspotErrors);
    }
  }

  const webhookUrl = n8nWebhookForFlow(flow);
  if (webhookUrl) {
    const webhookHeaders: Record<string, string> = { "Content-Type": "application/json" };
    const webhookSecret =
      process.env.MARKETING_N8N_WEBHOOK_SECRET?.trim() ||
      process.env.N8N_WEBHOOK_SECRET?.trim();
    if (webhookSecret) {
      const headerName =
        process.env.MARKETING_N8N_WEBHOOK_SECRET_HEADER?.trim() ||
        process.env.N8N_WEBHOOK_SECRET_HEADER?.trim() ||
        "X-Intraweb-Website-Intake-Secret";
      webhookHeaders[headerName] = webhookSecret;
    }
    const payload = {
      type: n8nEventType(flow),
      hubspotContactId: claims.sub,
      hubspotDealId: claims.dealId ?? null,
      calBookingUid: cal.uid,
      start: cal.start,
      end: cal.end,
      managementUrl,
      location: cal.location ?? null,
      email: claims.email,
    };
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: webhookHeaders,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(25_000),
      });
    } catch (e) {
      console.error(`[booking/book] n8n webhook failed (${flow}):`, e);
    }
  }

  return NextResponse.json({
    ok: true,
    booking: {
      uid: cal.uid,
      start: cal.start,
      end: cal.end,
      location: cal.location ?? null,
      managementUrl,
    },
    ...(hubspotErrors.length ? { hubspotWarnings: hubspotErrors } : {}),
  });
}
