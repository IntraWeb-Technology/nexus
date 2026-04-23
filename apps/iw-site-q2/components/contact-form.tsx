"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const PAIN_POINT_MAX = 1000;
const RECAPTCHA_ACTION = "contact";

const situations = [
  "I need a website built",
  "I want to automate manual processes",
  "I need AI integrated into my product or operations",
  "I'm building a SaaS product",
  "I want to start with a Diagnostic",
  "I'm not sure yet — I just want to talk",
] as const;

const budgets = ["Under $10K", "$10K – $25K", "$25K – $50K", "$50K+", "Not sure yet"] as const;

declare global {
  interface Window {
    grecaptcha?: {
      enterprise: {
        ready: (cb: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

function isGoogleApiKeyMistakenForSiteKey(key: string): boolean {
  return key.trim().startsWith("AIza");
}

function loadRecaptchaScript(siteKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (window.grecaptcha?.enterprise) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("reCAPTCHA failed to load"));
    document.head.appendChild(script);
  });
}

function splitName(name: string): { firstName: string; lastName: string } {
  const t = name.trim();
  if (!t) return { firstName: "—", lastName: "—" };
  const parts = t.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0]!, lastName: parts[0]! };
  }
  return { firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}

function buildPainPoint(parts: { message: string; situation: string; budget: string; referral: string }): string {
  const s = [
    `Situation: ${parts.situation}.`,
    `Budget: ${parts.budget}.`,
    parts.referral.trim() ? `Referral: ${parts.referral.trim()}.` : "",
    `Message: ${parts.message.trim()}`,
  ]
    .filter(Boolean)
    .join(" ");
  return s.replace(/\s+/g, " ").trim().slice(0, PAIN_POINT_MAX);
}

export function ContactForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recaptchaReady = useRef(false);

  const getRecaptchaToken = useCallback(async (): Promise<string | null> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) return null;
    if (isGoogleApiKeyMistakenForSiteKey(siteKey)) {
      console.error(
        "[reCAPTCHA] NEXT_PUBLIC_RECAPTCHA_SITE_KEY must be a reCAPTCHA Enterprise website key, not a Google API key."
      );
      return null;
    }
    try {
      if (!recaptchaReady.current) {
        await loadRecaptchaScript(siteKey);
        recaptchaReady.current = true;
      }
      return new Promise((resolve) => {
        window.grecaptcha!.enterprise.ready(() => {
          window
            .grecaptcha!.enterprise.execute(siteKey, { action: RECAPTCHA_ACTION })
            .then(resolve)
            .catch((err: unknown) => {
              console.error("[reCAPTCHA] enterprise.execute failed:", err);
              resolve(null);
            });
        });
      });
    } catch {
      return null;
    }
  }, []);

  return (
    <form
      className="contact-form"
      data-hs-ignore="true"
      onSubmit={async (e) => {
        e.preventDefault();
        setErrorMessage(null);
        setStatus("sending");
        const fd = new FormData(e.currentTarget);
        const name = String(fd.get("name") || "").trim();
        const company = String(fd.get("company") || "").trim();
        const email = String(fd.get("email") || "").trim();
        const phone = String(fd.get("phone") || "").trim();
        const situation = String(fd.get("situation") || "");
        const budget = String(fd.get("budget") || "");
        const message = String(fd.get("message") || "");
        const referral = String(fd.get("referral") || "");

        const { firstName, lastName } = splitName(name);
        const companyName = company || "Not provided";
        const painPoint = buildPainPoint({ message, situation, budget, referral });

        try {
          const recaptchaToken = await getRecaptchaToken();
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              firstName,
              lastName,
              companyName,
              phone,
              website: "",
              painPoint,
              recaptchaToken: recaptchaToken ?? undefined,
            }),
          });
          if (!response.ok) {
            const errData = (await response.json().catch(() => ({}))) as {
              message?: string;
              error?: string;
            };
            const userMessage =
              errData.message === "Invalid form data" && errData.error
                ? errData.error
                : errData.message || errData.error || "Submission failed";
            throw new Error(userMessage);
          }
          router.push("/thank-you?form=contact");
        } catch (err) {
          setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
          setStatus("idle");
        }
      }}
      style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%", maxWidth: "100%" }}
    >
      {errorMessage ? (
        <p role="alert" className="mono" style={{ fontSize: 13, color: "var(--iw-danger)" }}>
          {errorMessage}
        </p>
      ) : null}
      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "var(--iw-fg-1)" }}>
        Name
        <input name="name" required className="contact-input" placeholder="Your name" disabled={status === "sending"} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "var(--iw-fg-1)" }}>
        Company / Organization
        <input name="company" className="contact-input" placeholder="Company" disabled={status === "sending"} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "var(--iw-fg-1)" }}>
        Email
        <input
          name="email"
          type="email"
          required
          className="contact-input"
          placeholder="you@company.com"
          disabled={status === "sending"}
        />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "var(--iw-fg-1)" }}>
        Phone
        <input
          name="phone"
          type="tel"
          required
          className="contact-input"
          placeholder="+1 555 000 0000"
          autoComplete="tel"
          disabled={status === "sending"}
        />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "var(--iw-fg-1)" }}>
        What best describes your situation?
        <select name="situation" required className="contact-input" disabled={status === "sending"}>
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
        <select name="budget" required className="contact-input" disabled={status === "sending"}>
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
        <textarea
          name="message"
          required
          rows={5}
          className="contact-input"
          placeholder="Context, timeline, systems involved…"
          disabled={status === "sending"}
        />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "var(--iw-fg-1)" }}>
        How did you hear about us?
        <input
          name="referral"
          className="contact-input"
          placeholder="Referral, search, content, etc."
          disabled={status === "sending"}
        />
      </label>
      <div style={{ marginTop: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
          <span>{status === "sending" ? "Sending…" : "Submit"}</span>
        </button>
      </div>
    </form>
  );
}
