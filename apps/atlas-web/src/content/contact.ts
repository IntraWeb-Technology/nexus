/**
 * Contact fixture — Story-First Contact (Figma page 28).
 * Form delivery is handled by `/api/contact` (Resend); no CMS.
 */

export type ContactFixture = {
  seo: { title: string; description: string };
  chapter: string;
  title: string;
  body: string;
  bodyMobile: string;
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
      "Start a conversation about product systems, CMS architecture, automation, or design-to-build work.",
  },
  chapter: "CONTACT",
  title: "Start a conversation.",
  body: "Use this form for product systems, content infrastructure, technical architecture, or design-to-build implementation work.",
  bodyMobile:
    "Use this form for product systems, content infrastructure, or technical architecture work.",
  fields: {
    name: { label: "NAME", placeholder: "Your name" },
    email: { label: "EMAIL", placeholder: "you@company.com" },
    context: {
      label: "PROJECT CONTEXT",
      placeholder: "Product, platform, or architecture",
    },
    message: {
      label: "WHAT ARE YOU TRYING TO IMPROVE?",
      placeholder: "Tell me a bit about it…",
    },
  },
  submitLabel: "Send inquiry",
  meta: "If there is a fit, I’ll reply with a short next step rather than a pitch deck.",
  panels: [
    {
      label: "GOOD FIT",
      body: "Product systems, content platforms, technical architecture.",
    },
    {
      label: "NEXT STEP",
      body: "A short reply, usually within one business day.",
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
