"use client";

import { useCallback, useRef, useState } from "react";
import type { DataDeletionRequestType } from "@/lib/data-deletion";

const RECAPTCHA_ACTION = "data_deletion";

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

const requestTypes: { value: DataDeletionRequestType; label: string; description: string }[] = [
  {
    value: "delete_personal_data",
    label: "Delete my personal data",
    description: "Remove or anonymize your information across our systems, subject to legal retention.",
  },
  {
    value: "marketing_opt_out",
    label: "Opt out of marketing emails",
    description: "Stop promotional emails while keeping necessary service communications.",
  },
  {
    value: "access_copy",
    label: "Request a copy of my data",
    description: "Ask for a portable copy of personal information we hold about you.",
  },
];

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

export function DataDeletionForm() {
  const [email, setEmail] = useState("");
  const [requestType, setRequestType] = useState<DataDeletionRequestType>("delete_personal_data");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const recaptchaReady = useRef(false);

  const getRecaptchaToken = useCallback(async (): Promise<string | null> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) return null;
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
            .catch(() => resolve(null));
        });
      });
    } catch {
      return null;
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage(null);

    const recaptchaToken = await getRecaptchaToken();
    try {
      const res = await fetch("/api/data-deletion/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, requestType, note, recaptchaToken }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("sent");
      setMessage(data.message ?? "Check your email to confirm this request.");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="legal-contact-block">
        <h3>Check your email</h3>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      <div>
        <label htmlFor="deletion-email" className="block text-sm font-medium text-[#c8d1da]">
          Email address
        </label>
        <input
          id="deletion-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded border border-[#1f2b36] bg-[#071019] px-3 py-2 text-sm text-white"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-[#c8d1da]">Request type</legend>
        <div className="mt-3 space-y-3">
          {requestTypes.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer gap-3 rounded border border-[#1f2b36] bg-[#071019] p-3"
            >
              <input
                type="radio"
                name="requestType"
                value={opt.value}
                checked={requestType === opt.value}
                onChange={() => setRequestType(opt.value)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-white">{opt.label}</span>
                <span className="mt-1 block text-xs text-[#8d9aa7]">{opt.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="deletion-note" className="block text-sm font-medium text-[#c8d1da]">
          Additional details (optional)
        </label>
        <textarea
          id="deletion-note"
          rows={4}
          maxLength={2000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-2 w-full rounded border border-[#1f2b36] bg-[#071019] px-3 py-2 text-sm text-white"
        />
      </div>

      {message ? <p className="text-sm text-red-400">{message}</p> : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded bg-[#f5a623] px-5 py-2.5 text-sm font-semibold text-[#03070c] disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Submit request"}
      </button>
      <p className="text-xs text-[#8d9aa7]">
        We will email you a confirmation link. Requests are not processed until you confirm.
      </p>
    </form>
  );
}
