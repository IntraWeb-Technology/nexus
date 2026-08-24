"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { atlasStoryPrimaryButtonClassName } from "@/components/editorial/atlas-button";
import type { ContactFixture } from "@/content/contact";
import { CONTACT_INLINE_ERROR } from "@/content/resilience";
import type { ContactFieldErrors } from "@/lib/contact-validation";

type ContactFormProps = {
  data: ContactFixture;
};

type Status = "idle" | "submitting" | "success" | "error";

function localValidate(payload: {
  name: string;
  email: string;
  message: string;
}): ContactFieldErrors | null {
  const fields: ContactFieldErrors = {};
  if (!payload.name.trim()) fields.name = "Name is required";
  if (!payload.email.trim()) fields.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
    fields.email = "Enter a valid email address";
  }
  if (!payload.message.trim()) fields.message = "Message is required";
  return Object.keys(fields).length > 0 ? fields : null;
}

export function ContactForm({ data }: ContactFormProps) {
  const router = useRouter();
  const baseId = useId();
  const nameId = `${baseId}-name`;
  const emailId = `${baseId}-email`;
  const messageId = `${baseId}-message`;
  const companyId = `${baseId}-company`;
  const statusId = `${baseId}-status`;

  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
      company: String(formData.get("company") ?? ""),
    };

    const local = localValidate(payload);
    if (local) {
      setErrors(local);
      setStatus("error");
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        fields?: ContactFieldErrors;
      };

      if (!res.ok || !json.ok) {
        const fieldErrs = json.fields ?? {};
        setErrors(fieldErrs);
        if (fieldErrs.name || fieldErrs.email || fieldErrs.message) {
          setFormError(fieldErrs.form ?? null);
          setStatus("error");
          return;
        }
        setFormError(CONTACT_INLINE_ERROR);
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("success");
      router.push("/contact/confirmation");
    } catch {
      setFormError(CONTACT_INLINE_ERROR);
      setStatus("error");
    }
  }

  const inputClass =
    "w-full rounded-[2px] border border-atlas-border bg-atlas-elevated px-4 py-3.5 font-sans text-sm text-atlas-ink placeholder:text-atlas-muted outline-none transition-[border-color,background-color] duration-[var(--atlas-motion-fast)] ease-[var(--atlas-motion-ease-standard)] focus-visible:border-atlas-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-ink";

  return (
    <form
      className="relative flex w-full max-w-[30rem] flex-col gap-5"
      onSubmit={onSubmit}
      noValidate
      aria-describedby={status === "error" && formError ? statusId : undefined}
    >
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={companyId}>Company</label>
        <input
          id={companyId}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={nameId}
          className="font-sans text-[13px] font-medium text-atlas-umber"
        >
          {data.fields.name.label}
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder={data.fields.name.placeholder}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
          className={inputClass}
        />
        {errors.name ? (
          <p
            id={`${nameId}-error`}
            className="m-0 font-sans text-[13px] text-atlas-rust-ink"
            role="alert"
          >
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={emailId}
          className="font-sans text-[13px] font-medium text-atlas-umber"
        >
          {data.fields.email.label}
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={data.fields.email.placeholder}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          className={inputClass}
        />
        {errors.email ? (
          <p
            id={`${emailId}-error`}
            className="m-0 font-sans text-[13px] text-atlas-rust-ink"
            role="alert"
          >
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={messageId}
          className="font-sans text-[13px] font-medium text-atlas-umber"
        >
          {data.fields.message.label}
        </label>
        <textarea
          id={messageId}
          name="message"
          required
          rows={4}
          placeholder={data.fields.message.placeholder}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? `${messageId}-error` : undefined}
          className={`${inputClass} min-h-[8.75rem] resize-y`}
        />
        {errors.message ? (
          <p
            id={`${messageId}-error`}
            className="m-0 font-sans text-[13px] text-atlas-rust-ink"
            role="alert"
          >
            {errors.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className={`${atlasStoryPrimaryButtonClassName} w-fit`}
      >
        {status === "submitting" ? "Sending…" : data.submitLabel}
      </button>

      <div
        id={statusId}
        className="min-h-[1.25rem]"
        aria-live="polite"
        aria-atomic="true"
      >
        {status === "error" && formError ? (
          <p className="m-0 font-sans text-sm leading-[1.5] text-atlas-rust-ink" role="alert">
            {formError}
          </p>
        ) : null}
      </div>
    </form>
  );
}
