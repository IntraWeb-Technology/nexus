"use client";

import { useState } from "react";
const situations = [
  "I need a website built",
  "I want to automate manual processes",
  "I need AI integrated into my product or operations",
  "I'm building a SaaS product",
  "I want to start with a Diagnostic",
  "I'm not sure yet — I just want to talk",
] as const;

const budgets = ["Under $10K", "$10K – $25K", "$25K – $50K", "$50K+", "Not sure yet"] as const;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  return (
    <form
      className="contact-form"
      onSubmit={(e) => {
        e.preventDefault();
        setStatus("sent");
      }}
      style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 560 }}
    >
      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "var(--iw-fg-1)" }}>
        Name
        <input name="name" required className="contact-input" placeholder="Your name" />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "var(--iw-fg-1)" }}>
        Company / Organization
        <input name="company" className="contact-input" placeholder="Company" />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "var(--iw-fg-1)" }}>
        Email
        <input name="email" type="email" required className="contact-input" placeholder="you@company.com" />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "var(--iw-fg-1)" }}>
        What best describes your situation?
        <select name="situation" required className="contact-input">
          <option value="">Select…</option>
          {situations.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "var(--iw-fg-1)" }}>
        Approximate budget range
        <select name="budget" required className="contact-input">
          <option value="">Select…</option>
          {budgets.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "var(--iw-fg-1)" }}>
        Tell us what you&apos;re working on
        <textarea name="message" required rows={5} className="contact-input" placeholder="Context, timeline, systems involved…" />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "var(--iw-fg-1)" }}>
        How did you hear about us?
        <input name="referral" className="contact-input" placeholder="Referral, search, content, etc." />
      </label>
      <div style={{ marginTop: 8 }}>
        <button type="submit" className="btn btn-primary">
          <span>Submit</span>
        </button>
      </div>
      {status === "sent" && (
        <p className="mono" style={{ fontSize: 12, color: "var(--accent)", marginTop: 8 }}>
          Thanks. This prototype does not post to a server yet. Wire this form to your CRM or email when you are ready.
        </p>
      )}
    </form>
  );
}
