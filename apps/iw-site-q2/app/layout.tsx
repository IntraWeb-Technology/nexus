import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { organizationJsonLd } from "@/lib/geo-jsonld";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "IntraWeb | AI Automation & Web Systems for SMBs",
    template: "%s | IntraWeb",
  },
  description:
    "IntraWeb builds AI-powered web systems, workflow automation, and intelligent integrations for SMBs. Based in NJ, serving the NY metro and remote nationwide.",
  openGraph: {
    title: "IntraWeb",
    description: "AI systems and automation infrastructure for SMBs that want to operate smarter.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetbrainsMono.variable} ${dmSans.className}`}
    >
      <body>
        <JsonLd data={organizationJsonLd} />
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
