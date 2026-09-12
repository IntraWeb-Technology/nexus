import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
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
    default: "IntraWeb | Senior-Led Software Engineering",
    template: "%s | IntraWeb",
  },
  description:
    "Senior-led software engineering that builds, integrates, modernizes, and stabilizes production systems.",
  openGraph: {
    title: "IntraWeb",
    description: "Software engineering for systems that have to work in production.",
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
        {children}
      </body>
    </html>
  );
}
