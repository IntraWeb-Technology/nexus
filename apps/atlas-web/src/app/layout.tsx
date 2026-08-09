import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteNavActive } from "@/components/chrome/site-nav-active";
import { homepageFixture } from "@/content/homepage";
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
  title: {
    default: "Atlas",
    template: "%s · Atlas",
  },
  description:
    "Systems that earn trust — platforms and operating systems by John Schibelli.",
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
          brand={homepageFixture.nav.brand}
          links={homepageFixture.nav.links}
        />
        {children}
        <SiteFooter
          links={homepageFixture.footer.links}
          mark={homepageFixture.footer.mark}
        />
      </body>
    </html>
  );
}
