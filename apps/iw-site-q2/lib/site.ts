export const scheduleUrl =
  process.env.NEXT_PUBLIC_SCHEDULE_URL ?? "https://calendly.com";

export const contactEmail = "jschibelli@gmail.com";

export const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Diagnostic", href: "/diagnostic" },
  { label: "Contact", href: "/contact" },
] as const;
