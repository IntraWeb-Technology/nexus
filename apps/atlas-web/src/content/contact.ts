/**
 * Contact fixture — static UI copy for the quiet Contact route (Figma Page 23).
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
    message: { label: string; placeholder: string };
  };
  submitLabel: string;
  meta: string;
  success: { title: string; body: string };
  failure: { title: string; body: string };
};

export const contactFixture: ContactFixture = {
  seo: {
    title: "Contact",
    description:
      "Start a conversation about product systems, architecture, and delivery.",
  },
  chapter: "CONTACT",
  title: "Start a conversation.",
  body: "Placeholder — a quiet invitation for qualified conversations about product systems, architecture, and delivery. No pitch deck energy.",
  fields: {
    name: { label: "NAME", placeholder: "Placeholder name" },
    email: { label: "EMAIL", placeholder: "you@domain" },
    message: {
      label: "MESSAGE",
      placeholder: "What are you trying to build?",
    },
  },
  submitLabel: "Send",
  meta: "email · calendar (TBD)  ·  Expectation-setting note placeholder.",
  success: {
    title: "Message sent.",
    body: "Thanks — I’ll reply when I’ve read it carefully.",
  },
  failure: {
    title: "Couldn’t send right now.",
    body: "Please try again in a moment, or reach out by email.",
  },
};
