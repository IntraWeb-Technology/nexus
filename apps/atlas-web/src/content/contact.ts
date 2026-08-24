/**
 * Contact fixture — Approved — Contact (Figma production).
 * Form delivery is handled by `/api/contact` (Resend); no CMS.
 */

export type ContactFixture = {
  seo: { title: string; description: string };
  chapter: string;
  title: string;
  body: string;
  fields: {
    name: { label: string; placeholder: string };
    email: { label: string; placeholder: string };
    context: { label: string; placeholder: string };
    message: { label: string; placeholder: string };
  };
  submitLabel: string;
  meta: string;
  panels: Array<{ label: string; body: string }>;
  success: { title: string; body: string };
  failure: { title: string; body: string };
};

export const contactFixture: ContactFixture = {
  seo: {
    title: "Contact",
    description:
      "Start a conversation about product systems, architecture, content infrastructure, automation, and design-to-build implementation.",
  },
  chapter: "CONTACT",
  title: "Start a conversation.",
  body: "Use this form for product systems, content infrastructure, technical architecture, or design-to-build implementation work.",
  fields: {
    name: { label: "NAME", placeholder: "Your name" },
    email: { label: "EMAIL", placeholder: "you@example.com" },
    context: {
      label: "PROJECT CONTEXT",
      placeholder: "Existing stack, current bottleneck, desired outcome",
    },
    message: {
      label: "WHAT ARE YOU TRYING TO IMPROVE?",
      placeholder: "What is already built, and where is it getting stuck?",
    },
  },
  submitLabel: "Send inquiry",
  meta: "If there is a fit, I’ll reply with a short next step rather than a pitch deck.",
  panels: [
    {
      label: "GOOD FIT",
      body: "Product systems, CMS and content infrastructure, technical architecture, design-to-build implementation.",
    },
    {
      label: "HELPFUL CONTEXT",
      body: "A useful note usually includes the product context, what is already built, where the system is getting stuck, and what kind of outcome you need.",
    },
    {
      label: "NEXT STEP",
      body: "If there is a fit, expect a short reply with a suggested path forward — not a pitch deck.",
    },
  ],
  success: {
    title: "Message received.",
    body: "Thanks for reaching out. I’ll review your note and reply if there’s a clear fit.",
  },
  failure: {
    title: "Couldn’t send right now.",
    body: "Your message could not be sent. Please try again, or email me directly if the issue continues.",
  },
};
