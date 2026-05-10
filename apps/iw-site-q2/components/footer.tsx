import Image from "next/image";
import Link from "next/link";
import type { ReactNode, SVGProps } from "react";
import { companyLegalName, contactEmail, systemsCallUrl } from "@/lib/site";
import { IntraWebLogo } from "@/components/intraweb-logo";
import { Ic } from "@/components/icons";

const footerLinks = [
  { label: "What We Do", href: "/services" },
  { label: "How We Work", href: "/work" },
  { label: "Proof", href: "/#proof" },
  { label: "Who It’s For", href: "/#fit" },
  { label: "About", href: "/about" },
] as const;

function IconSq({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="grid size-9 place-items-center rounded-[4px] border border-[#1f2b36] text-[#8d9aa7] transition-colors duration-200 hover:border-[#f5a623] hover:text-[#f5a623]"
    >
      {children}
    </a>
  );
}

function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect x="3.75" y="5.25" width="16.5" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 3.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16.5 3.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4.25 10h15.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 13.5h2M14 13.5h2M8 17h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IndustryGlyph({ type }: { type: "logistics" | "manufacturing" | "distribution" | "services" }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.35,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (type === "logistics") {
    return (
      <svg {...common}>
        <path d="M3 7h10v10H3z" />
        <path d="M13 10h4l3 3v4h-7z" />
        <path d="M6.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
        <path d="M17.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      </svg>
    );
  }

  if (type === "manufacturing") {
    return (
      <svg {...common}>
        <path d="M4 19V9l5 3V9l5 3V6h4v13z" />
        <path d="M7 16h2M12 16h2" />
      </svg>
    );
  }

  if (type === "distribution") {
    return (
      <svg {...common}>
        <path d="m12 3 7 4v10l-7 4-7-4V7z" />
        <path d="m5 7 7 4 7-4" />
        <path d="M12 11v10" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M17 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

const industries = [
  { label: "Logistics", type: "logistics" },
  { label: "Manufacturing", type: "manufacturing" },
  { label: "Distribution", type: "distribution" },
  { label: "Services", type: "services" },
] as const;

export function Footer() {
  return (
    <footer className="relative z-[2] overflow-hidden border-t border-[#1f2b36] bg-[#03070c] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(860px_420px_at_18%_8%,rgba(31,43,54,0.28),transparent_64%),linear-gradient(180deg,#071019_0%,#03070c_100%)]" />

      <div className="relative mx-auto max-w-[1440px] px-8 py-20 md:px-12 lg:px-16 lg:py-24">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_1.25fr_1fr] lg:gap-14 xl:gap-20">
          <div className="relative min-h-[360px] overflow-hidden pb-24 md:min-h-[420px] lg:border-r lg:border-[#1f2b36]/70 lg:pr-12">
            <div className="relative z-10">
              <div className="mb-6">
                <IntraWebLogo height={30} />
              </div>
              <p className="max-w-[320px] text-[15px] leading-relaxed text-[#c8d1da]">
                We build the operational infrastructure that connects how you work to how you scale.
              </p>
              <div className="mt-7 flex gap-3">
                <IconSq href="https://www.linkedin.com/company/intrawebtech" label="LinkedIn">
                  <Ic.linkedin width={16} height={16} />
                </IconSq>
                <IconSq href="https://twitter.com/intrawebtech" label="X">
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </IconSq>
                <IconSq href={`mailto:${contactEmail}`} label="Email">
                  <Ic.mail width={16} height={16} />
                </IconSq>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-10 -left-12 right-[-12%] h-[260px] opacity-40 md:h-[310px] lg:opacity-45">
              <Image
                src="/footer-col-1.png"
                alt=""
                fill
                sizes="(min-width: 1024px) 34vw, 90vw"
                className="object-cover object-left-bottom"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071019] via-[#071019]/20 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_32%_62%,transparent_0%,transparent_38%,#071019_78%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,#071019_0%,transparent_18%,transparent_62%,#071019_100%)]" />
            </div>
          </div>

          <div className="max-w-[560px] lg:border-r lg:border-[#1f2b36]/70 lg:pr-12">
            <p className="mono text-xs font-medium uppercase tracking-[0.22em] text-[#f5a623]">
              Infrastructure. Alignment. Scale.
            </p>
            <h2 className="mt-6 max-w-[620px] text-4xl font-medium leading-[1.08] tracking-[-0.035em] text-white lg:text-[2.75rem]">
              We operate where complexity lives.
            </h2>
            <div className="mt-7 h-px w-12 bg-[#f5a623]" />
            <div className="mt-7 flex max-w-[520px] flex-col gap-6 text-[15px] leading-relaxed text-[#c8d1da]">
              <p className="text-[15px] leading-relaxed text-[#c8d1da]">
                Inside organizations where systems don’t speak, handoffs break down, and growth creates more friction
                than momentum.
              </p>
              <p className="text-[15px] leading-relaxed text-[#c8d1da]">
                We bring operational clarity, connect the right parts, and build infrastructure that holds under
                pressure.
              </p>
            </div>
          </div>

          <div>
            <nav aria-label="Footer">
              <ul className="m-0 flex list-none flex-col p-0">
                {footerLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group flex items-center justify-between border-b border-[#1f2b36] py-4 text-[15px] text-[#c8d1da] transition-colors duration-200 hover:border-[#f5a623] hover:text-white"
                    >
                      <span>{l.label}</span>
                      <span
                        className="text-[#f5a623] transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <a
              href={systemsCallUrl}
              className="group mt-9 flex border border-[rgba(245,166,35,0.45)] bg-[rgba(11,20,29,0.7)] p-6 transition-colors duration-200 hover:border-[#f5a623] md:p-8"
            >
              <CalendarIcon className="mt-0.5 size-9 shrink-0 text-[#f5a623]" />
              <span className="ml-5 min-w-0 flex-1">
                <span className="flex items-center justify-between gap-4 text-[15px] font-semibold text-[#f5a623]">
                  <span>Book a Systems Call</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden>
                    →
                  </span>
                </span>
                <span className="mt-2 block max-w-[260px] text-sm leading-relaxed text-[#c8d1da]">
                  A focused conversation about your systems and where friction lives.
                </span>
              </span>
            </a>
          </div>
        </div>

        <div className="mt-16 border-t border-[#1f2b36] py-8 lg:mt-20">
          <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:justify-between xl:gap-8">
            <div className="min-w-0 flex-1 xl:pr-4">
              <div className="grid gap-5 sm:grid-cols-[40px_1fr] sm:items-center">
                <div className="flex size-10 shrink-0 items-center justify-center text-[#f5a623]">
                  <Ic.shield width={28} height={28} />
                </div>
                <div className="grid min-w-0 gap-3 md:grid-cols-[max-content_minmax(0,1fr)] md:items-center md:gap-6 lg:gap-8">
                  <p className="mono max-w-[420px] text-[10px] uppercase leading-relaxed tracking-[0.16em] text-[#c8d1da]">
                    Trusted by operations leaders
                    <br />
                    in complex organizations
                  </p>
                  <p className="min-w-0 text-pretty text-sm leading-relaxed text-[#8d9aa7]">
                    We work alongside teams carrying real weight
                    <br />
                    where operational performance drives everything.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap justify-start gap-x-5 gap-y-5 text-[#8d9aa7] sm:justify-between sm:gap-x-5 xl:w-auto xl:justify-end xl:gap-x-6">
              {industries.map((industry) => (
                <div
                  key={industry.label}
                  className="flex w-[calc(50%-0.625rem)] flex-col items-center gap-2 sm:w-auto sm:min-w-[5.5rem]"
                >
                  <IndustryGlyph type={industry.type} />
                  <span className="text-center text-xs leading-snug text-[#8d9aa7]">{industry.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#1f2b36] pt-6 font-mono text-[11px] tracking-[0.06em] text-[#8d9aa7]">
          <span>© 2026 {companyLegalName}</span>
          <span className="flex flex-wrap items-center gap-6">
            <Link href="/privacy" className="transition-colors duration-200 hover:text-[#c8d1da]">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors duration-200 hover:text-[#c8d1da]">
              Terms
            </Link>
            <span>NJ • USA</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
