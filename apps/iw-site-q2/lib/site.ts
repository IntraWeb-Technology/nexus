export const scheduleUrl =
  process.env.NEXT_PUBLIC_SCHEDULE_URL ?? "https://calendly.com";

export const accountsUrl =
  process.env.NEXT_PUBLIC_ACCOUNTS_URL ?? "https://accounts.intrawebtech.com";

/** Public inbound email (link text + mailto in footer, contact) */
export const contactEmail = "human@intrawebtech.com";

export const companyLegalName = "IntraWeb Technologies, LLC.";

export const navLinks = [
  { label: "What We Do", href: "/services" },
  { label: "How We Work", href: "/work" },
  { label: "Proof", href: "/#proof" },
  { label: "Who It’s For", href: "/#fit" },
  { label: "About", href: "/about" },
] as const;

/** Primary homepage / nav conversion action */
export const systemsCallUrl = "/contact";
