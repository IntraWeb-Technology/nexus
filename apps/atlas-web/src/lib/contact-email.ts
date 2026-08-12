import { Resend } from "resend";

/** Lazy init so `next build` does not require RESEND_API_KEY at module load. */
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(key);
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export type ContactEmailPayload = {
  name: string;
  email: string;
  message: string;
};

/**
 * Deliver Atlas contact form via Resend — smallest Nexus production pattern
 * (portal/iw-site Resend helpers) without HubSpot/n8n/reCAPTCHA Enterprise.
 */
export async function sendContactEmail(
  payload: ContactEmailPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const to = process.env.CONTACT_EMAIL?.trim();
  if (!to) {
    return { ok: false, error: "CONTACT_EMAIL is not configured" };
  }

  const from =
    process.env.RESEND_FROM?.trim() ||
    "Atlas Contact <onboarding@resend.dev>";

  const subject = `Atlas contact — ${payload.name}`;
  const text = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    "",
    payload.message,
  ].join("\n");

  const html = `
    <div style="font-family:Inter,system-ui,sans-serif;color:#1a1814;line-height:1.5">
      <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
      <p style="white-space:pre-wrap">${escapeHtml(payload.message)}</p>
    </div>
  `;

  try {
    const { error } = await getResend().emails.send({
      from,
      to,
      replyTo: payload.email,
      subject,
      text,
      html,
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send failed";
    return { ok: false, error: message };
  }
}
