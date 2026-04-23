"use client";

import { PageHero } from "@/components/page-hero";
import { Btn, Reveal } from "@/components/primitives";
import { ContactForm } from "@/components/contact-form";
import { companyLegalName, contactEmail, scheduleUrl } from "@/lib/site";

export function ContactPageContent() {
  return (
    <main>
      <PageHero
        title={
          <>
            Let&apos;s figure out if we&apos;re a fit.
          </>
        }
        subhead="IntraWeb takes on a limited number of engagements at a time. Fill out the form and we\u2019ll respond within one business day with either a next step or an honest answer about fit."
      />
      <div className="container page-inner page-inner--after-hero">
        <div className="contact-page__grid">
          <Reveal>
            <ContactForm />
          </Reveal>
          <aside className="contact-page__aside" aria-label="Call and contact details">
            <Reveal delay={80}>
              <h2 className="contact-page__aside-title">Prefer a direct conversation?</h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="contact-page__aside-lead">
                Schedule a 30-minute discovery call. No pitch deck. Just an honest conversation about what you are trying
                to accomplish and whether IntraWeb can help.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <div className="contact-page__aside-cta">
                <Btn href={scheduleUrl} variant="secondary">
                  Schedule a Call via Calendly
                </Btn>
              </div>
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
    </main>
  );
}
