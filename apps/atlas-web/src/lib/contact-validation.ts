import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(254, "Email is too long"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(4000, "Message is too long"),
  /** Honeypot — bots fill this; humans leave empty. */
  company: z.string().optional().default(""),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export type ContactFieldErrors = Partial<
  Record<"name" | "email" | "message" | "form", string>
>;

export function fieldErrorsFromZod(
  error: z.ZodError,
): ContactFieldErrors {
  const out: ContactFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key === "name" || key === "email" || key === "message") {
      if (!out[key]) out[key] = issue.message;
    }
  }
  return out;
}
