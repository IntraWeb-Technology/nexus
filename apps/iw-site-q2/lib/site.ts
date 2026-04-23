export const scheduleUrl =
  process.env.NEXT_PUBLIC_SCHEDULE_URL ?? "https://calendly.com";

export const accountsUrl =
  process.env.NEXT_PUBLIC_ACCOUNTS_URL ?? "https://accounts.intrawebtech.com";

/** Public inbound email (link text + mailto in footer, contact) */
export const contactEmail = "human@intrawebtech.com";

export const companyLegalName = "IntraWeb Technologies, LLC.";

export const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Diagnostic", href: "/diagnostic" },
  { label: "Contact", href: "/contact" },
] as const;
