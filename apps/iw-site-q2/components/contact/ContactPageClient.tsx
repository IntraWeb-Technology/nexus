// apps/iw-site-q2/components/contact/ContactPageClient.tsx

"use client";

import { useState } from "react";
import { Reveal } from "@/components/primitives";
import { companyLegalName, contactEmail } from "@/lib/site";
import { ContactForm, type ContactFormSuccessPayload } from "@/components/contact/ContactForm";
import { DiagnosticScheduler } from "@/components/contact/DiagnosticScheduler";

type SubmitState = ContactFormSuccessPayload & {
  submitted: boolean;
};

export function ContactPageClient() {
  const [submitState, setSubmitState] = useState<SubmitState | null>(null);

  const handleSuccess = (payload: ContactFormSuccessPayload) => {
    setSubmitState({ ...payload, submitted: true });
  };

  return (
    <div className="container page-inner page-inner--after-hero">
      <div className="contact-page__grid">
        <div>
          <Reveal>
            {submitState?.submitted ? (
              <div
                className="mb-6 rounded-lg border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm text-teal-100"
                role="status"
              >
                Thanks — we received your message and will respond within one business day. Pick a diagnostic time
                below, or come back later from your confirmation email.
              </div>
            ) : null}
            <ContactForm onSuccess={handleSuccess} disabled={submitState?.submitted ?? false} />
          </Reveal>
          {submitState?.submitted ? (
            <Reveal delay={80}>
              <DiagnosticScheduler
                bookingSession={submitState.bookingSession ?? null}
                contactId={submitState.contactId}
                dealId={submitState.dealId}
                email={submitState.email}
                firstName={submitState.firstName}
                lastName={submitState.lastName}
                companyName={submitState.companyName}
              />
            </Reveal>
          ) : null}
        </div>
        <aside className="contact-page__aside" aria-label="Contact details">
          <Reveal delay={80}>
            <h2 className="contact-page__aside-title">What happens next</h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="contact-page__aside-lead">
              After you submit, you can book a 30-minute diagnostic call inline. We use your answers to prepare — no
              pitch deck, just an honest conversation about fit.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <div className="contact-page__aside-meta">
              <strong>{companyLegalName}</strong>
              <br />
              Towaco, NJ (serving the NY/NJ metro + remote nationwide)
              <br />
              <a href={`mailto:${contactEmail}`} className="contact-page__aside-email">
                {contactEmail}
              </a>
            </div>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
