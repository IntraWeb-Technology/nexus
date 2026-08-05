"use client";

import { useEffect, type CSSProperties } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

const CAL_LINK = "intraweb/discovery";
const NAMESPACE = "discovery";

type DiagnosticCalEmbedProps = {
  /** For testing or alternate org links */
  calLink?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * In-page Cal.com embed for the AI Workflow Diagnostic (intraweb/discovery).
 * Matches Cal.com “React Embed” snippet (namespace + month_view UI).
 */
export function DiagnosticCalEmbed({ calLink = CAL_LINK, className, style }: DiagnosticCalEmbedProps) {
  useEffect(() => {
    void (async function initCal() {
      const cal = await getCalApi({ namespace: NAMESPACE });
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  return (
    <div
      className={className}
      style={{
        width: "100%",
        minHeight: "min(75vh, 800px)",
        borderRadius: "var(--r-lg, 14px)",
        border: "1px solid var(--card-border-on-dark, rgba(255,255,255,0.08))",
        background: "var(--page-bg-elevated-dark, rgba(16, 26, 46, 0.75))",
        overflow: "hidden",
        ...style,
      }}
    >
      <Cal
        namespace={NAMESPACE}
        calLink={calLink}
        style={{ width: "100%", height: "100%", minHeight: "min(75vh, 800px)", overflow: "auto" }}
        config={{ layout: "month_view", useSlotsViewOnSmallScreen: "true" }}
      />
    </div>
  );
}
