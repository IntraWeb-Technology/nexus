import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteNavActive } from "@/components/chrome/site-nav-active";
import { siteChrome } from "@/lib/content";
import "@/styles/globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://johnschibelli.dev"),
  title: {
    default: "Atlas",
    template: "%s · Atlas",
  },
  description:
    "Systems that earn trust — platforms and operating systems by John Schibelli.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    siteName: "Atlas",
    title: "Atlas",
    description:
      "Systems that earn trust — platforms and operating systems by John Schibelli.",
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        alt: "Atlas — Systems that earn trust",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas",
    description:
      "Systems that earn trust — platforms and operating systems by John Schibelli.",
    images: ["/og/default.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F3F0E9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-dvh bg-atlas-paper font-sans text-atlas-body antialiased">
        <SiteNavActive
          brand={siteChrome.brand}
          links={siteChrome.navLinks}
          socialLinks={siteChrome.socialLinks}
        />
        {children}
        <SiteFooter
          links={siteChrome.footerLinks}
          copyright={siteChrome.copyright}
          socialLinks={siteChrome.socialLinks}
        />
      </body>
    </html>
  );
}
