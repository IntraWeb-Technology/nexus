/**
 * Story-First resilience surfaces — 404, article missing, CMS unavailable, privacy.
 * Copy locked to Figma page 28 approved nodes.
 */

import type { NavLink } from "@/content/types";

export type ResiliencePath = {
  /** When set, the label is linked; otherwise the whole line is plain text. */
  href?: string;
  label: string;
  description: string;
};

export type ResilienceSurface = {
  seo: { title: string; description: string };
  marker: string;
  display: string;
  title: string;
  body: string;
  panelLabel: string;
  paths: ResiliencePath[];
  primary: NavLink;
  secondary: NavLink;
  /** Privacy and similar: path lines are statements, not “Label — description”. */
  pathStyle?: "nav" | "statement";
};

export const notFoundSurface: ResilienceSurface = {
  seo: {
    title: "Page not found",
    description:
      "The page you’re looking for may have moved, been renamed, or never made it out of draft.",
  },
  marker: "404",
  display: "404",
  title: "Page not found.",
  body: "The page you’re looking for may have moved, been renamed, or never made it out of draft.",
  panelLabel: "SUGGESTED PATHS",
  paths: [
    {
      href: "/work",
      label: "Work",
      description: "current systems and case studies",
    },
    {
      href: "/articles",
      label: "Articles",
      description: "notes on design, engineering, and delivery",
    },
    {
      href: "/contact",
      label: "Contact",
      description: "send a note if something seems broken",
    },
  ],
  primary: { label: "Back to home", href: "/" },
  secondary: { label: "View work", href: "/work" },
};

export const articleNotFoundSurface: ResilienceSurface = {
  seo: {
    title: "Article not found",
    description:
      "This article may have moved, been unpublished, or never existed at this address.",
  },
  marker: "ARTICLE",
  display: "ARTICLE",
  title: "Article not found.",
  body: "This article may have moved, been unpublished, or never existed at this address.",
  panelLabel: "TRY THIS INSTEAD",
  paths: [
    {
      href: "/articles",
      label: "Articles",
      description: "browse the full archive",
    },
    {
      href: "/work",
      label: "Work",
      description: "recent systems and case studies",
    },
    {
      href: "/contact",
      label: "Contact",
      description: "send a note if a link is broken",
    },
  ],
  primary: { label: "Read articles", href: "/articles" },
  secondary: { label: "Back to home", href: "/" },
};

export const contentUnavailableSurface: ResilienceSurface = {
  seo: {
    title: "Content unavailable",
    description:
      "The site is online, but this content source is not responding right now. Please try again shortly.",
  },
  marker: "CONTENT",
  display: "CONTENT",
  title: "Content unavailable.",
  body: "The site is online, but this content source is not responding right now. Please try again shortly.",
  panelLabel: "WHAT YOU CAN DO",
  pathStyle: "statement",
  paths: [
    { label: "Return home and keep browsing", description: "" },
    { label: "Try the page again in a few minutes", description: "" },
    { label: "Send a note if the issue continues", description: "" },
  ],
  primary: { label: "Back to home", href: "/" },
  secondary: { label: "Contact", href: "/contact" },
};

export const privacySurface: ResilienceSurface = {
  seo: {
    title: "Privacy",
    description:
      "If you send a message through the contact form, the information you provide is used only to read and respond to that inquiry.",
  },
  marker: "PRIVACY",
  display: "PRIVACY",
  title: "Privacy.",
  body: "If you send a message through the contact form, the information you provide is used only to read and respond to that inquiry.",
  panelLabel: "SHORT VERSION",
  pathStyle: "statement",
  paths: [
    {
      label: "No newsletter signup is implied by sending a note",
      description: "",
    },
    {
      label: "No submitted contact details are sold or shared for advertising",
      description: "",
    },
    {
      label: "Analytics may be used to understand site performance",
      description: "",
    },
  ],
  primary: { label: "Contact", href: "/contact" },
  secondary: { label: "Back to home", href: "/" },
};

export type ContactConfirmationContent = {
  seo: { title: string; description: string };
  title: string;
  body: string;
  panels: Array<{ label: string; body: string }>;
  primary: NavLink;
  secondary: NavLink;
};

export const contactConfirmationContent: ContactConfirmationContent = {
  seo: {
    title: "Message received",
    description:
      "Thanks for reaching out. I’ll review your note and reply if there’s a clear fit.",
  },
  title: "Message received.",
  body: "Thanks for reaching out. I’ll review your note and reply if there’s a clear fit.",
  panels: [
    {
      label: "WHAT HAPPENS NEXT",
      body: "If the project is a good fit, I’ll send back a practical next step.",
    },
    {
      label: "IN THE MEANTIME",
      body: "You can return to the site or read recent articles while I review the note.",
    },
    {
      label: "RESPONSE WINDOW",
      body: "I usually reply within 2-3 business days.",
    },
  ],
  primary: { label: "Back to home", href: "/" },
  secondary: { label: "Read articles", href: "/articles" },
};

export const CONTACT_INLINE_ERROR =
  "Your message could not be sent. Please try again, or email me directly if the issue continues.";
