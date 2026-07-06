// apps/iw-site-q2/components/contact/DiagnosticScheduler.tsx

"use client";

import { useState } from "react";
import KickoffScheduler from "@/components/website-intake/KickoffScheduler";
import { diagnosticFallbackUrl } from "@/lib/site";

type DiagnosticSchedulerProps = {
  bookingSession: string | null;
  contactId?: string;
  dealId?: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
};

export function DiagnosticScheduler({
  bookingSession,
  email,
  firstName,
  lastName,
  companyName,
}: DiagnosticSchedulerProps) {
  const [unavailable, setUnavailable] = useState(false);

  if (!bookingSession) {
    return null;
  }

  if (unavailable) {
    return (
      <div className="mt-10 rounded-xl border border-gray-800 bg-gray-950/60 p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-300/90">Scheduling</p>
        <h3 className="mt-2 text-xl font-heading font-semibold text-white">Book your diagnostic call</h3>
        <p className="mt-3 text-sm text-gray-300 leading-relaxed">
          Our in-app scheduler is temporarily unavailable. Use the Cal.com link below to pick a time — we already have
          your details.
        </p>
        <a
          href={diagnosticFallbackUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center rounded-md border border-teal-500/50 px-4 py-2.5 text-sm font-semibold text-teal-200 transition-colors hover:bg-teal-500/10"
        >
          Open scheduling page
        </a>
      </div>
    );
  }

  const displayName = `${firstName} ${lastName}`.trim() || email;
  const diagnosticTitle = `${companyName !== "Not provided" ? companyName : displayName} — Diagnostic call`;

  return (
    <div className="mt-10 pt-10 border-t border-gray-800">
      <div className="mb-8 rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-gray-950/60 to-orange-500/10 p-6 sm:p-7">
        <p className="text-xs uppercase tracking-[0.3em] text-teal-300">Next step</p>
        <h3 className="mt-2 text-2xl font-heading font-semibold text-white">Schedule your diagnostic call</h3>
        <p className="mt-3 text-sm text-gray-300 leading-relaxed max-w-3xl">
          Pick a 30-minute time below. No pitch deck — just an honest conversation about what you are trying to
          accomplish and whether IntraWeb can help.
        </p>
      </div>
      <KickoffScheduler
        bookingSession={bookingSession}
        submittedData={{
          firstName,
          lastName,
          email,
          businessName: companyName,
        }}
        fallbackCalUrl={diagnosticFallbackUrl}
        kickoffTitle={diagnosticTitle}
        flow="diagnostic"
        endpoints={{ slots: "/api/booking/slots", book: "/api/booking/book" }}
        onUnavailable={() => setUnavailable(true)}
        onContinue={() => {
          /* Diagnostic flow stays on page; confirmation is shown inline by KickoffScheduler */
        }}
      />
    </div>
  );
}
