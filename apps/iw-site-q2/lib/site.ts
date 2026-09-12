export const diagnosticFallbackUrl =
  process.env.NEXT_PUBLIC_DIAGNOSTIC_CAL_URL ?? "https://cal.com/intraweb/discovery";

export const accountsUrl =
  process.env.NEXT_PUBLIC_ACCOUNTS_URL ?? "https://accounts.intrawebtech.com";

/** Public inbound email (link text + mailto in footer, contact) */
export const contactEmail = "human@intrawebtech.com";

/** Privacy / data subject requests */
export const privacyEmail = "privacy@intrawebtech.com";

export const companyLegalName = "IntraWeb Technologies, LLC.";

export const navLinks = [
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Proof", href: "/#proof" },
  { label: "About", href: "/about" },
] as const;

/** Primary homepage / nav conversion action */
export const systemsCallUrl = "/contact";
