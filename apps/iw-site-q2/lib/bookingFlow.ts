// apps/iw-site-q2/lib/bookingFlow.ts

import {
  type CalEventResolution,
  getCalEventResolution,
  parseCalKickoffLink,
} from "@/lib/calcomApi";
import type { BookingFlow } from "@/lib/bookingFlowTypes";

export type { BookingFlow } from "@/lib/bookingFlowTypes";

const DEFAULT_DIAGNOSTIC_CAL_LINK = "intraweb/discovery";
const DEFAULT_DIAGNOSTIC_FALLBACK_URL = "https://cal.com/intraweb/discovery";

function diagnosticCalLink(): string {
  return process.env.CAL_DIAGNOSTIC_CAL_LINK?.trim() || DEFAULT_DIAGNOSTIC_CAL_LINK;
}

/** Resolve Cal event type for slots/book API calls. */
export function resolveEventType(flow: BookingFlow): CalEventResolution | null {
  if (flow === "kickoff") {
    return getCalEventResolution();
  }

  const idStr = process.env.CAL_DIAGNOSTIC_EVENT_TYPE_ID?.trim();
  if (idStr) {
    const n = Number(idStr);
    if (Number.isFinite(n) && n > 0) {
      return { kind: "id", eventTypeId: n };
    }
  }

  const link = diagnosticCalLink();
  const parsed = parseCalKickoffLink(link);
  if (!parsed) return null;
  const org = process.env.CAL_ORGANIZATION_SLUG?.trim();
  return {
    kind: "slug",
    username: parsed.username,
    eventTypeSlug: parsed.eventTypeSlug,
    ...(org ? { organizationSlug: org } : {}),
  };
}

/** Public Cal.com link for degraded-mode fallback (Cal API down). */
export function resolveFallbackUrl(flow: BookingFlow): string {
  if (flow === "diagnostic") {
    return process.env.NEXT_PUBLIC_DIAGNOSTIC_CAL_URL?.trim() || DEFAULT_DIAGNOSTIC_FALLBACK_URL;
  }
  const link = process.env.NEXT_PUBLIC_CAL_KICKOFF_CAL_LINK?.trim() || "intraweb/website-discovery";
  if (link.startsWith("http")) {
    return link;
  }
  return `https://cal.com/${link.replace(/^\/+/, "")}`;
}
