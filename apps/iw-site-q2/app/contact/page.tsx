import type { Metadata } from "next";
import { Btn } from "@/components/primitives";
import { ContactForm } from "@/components/contact-form";
import { contactEmail, scheduleUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact IntraWeb Technologies | Start a Project or Book a Diagnostic",
  description:
    "Ready to automate your operations or build your next web system? Contact IntraWeb Technologies to start the conversation.",
};

export default function ContactPage() {
  return (
    <div className="container page-inner">
      <h1>Let&apos;s figure out if we&apos;re a fit.</h1>
      <p className="lead">
        IntraWeb takes on a limited number of engagements at a time. Fill out the form and we&apos;ll respond within one
        business day with either a next step or an honest answer about fit.
      </p>

      <ContactForm />

      <h2 style={{ marginTop: 56 }}>Prefer a direct conversation?</h2>
      <p>Schedule a 30-minute discovery call. No pitch deck. Just an honest conversation about what you are trying to accomplish and whether IntraWeb can help.</p>
      <Btn variant="secondary" href={scheduleUrl}>
        Schedule a Call via Calendly
      </Btn>

      <div style={{ marginTop: 48, fontSize: 15, color: "var(--iw-fg-2)", lineHeight: 1.7 }}>
        <strong style={{ color: "var(--iw-fg)" }}>IntraWeb Technologies LLC</strong>
        <br />
        Towaco, NJ (serving the NY/NJ metro + remote nationwide)
        <br />
        <a href={`mailto:${contactEmail}`} style={{ color: "var(--accent)" }}>
          {contactEmail}
        </a>
      </div>
    </div>
  );
}
