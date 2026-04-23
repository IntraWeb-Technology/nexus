import type { Metadata } from "next";
import { AboutPageContent } from "@/components/pages/about-content";

export const metadata: Metadata = {
  title: { absolute: "About IntraWeb | AI-First Engineering Studio, NJ" },
  description:
    "IntraWeb is a boutique AI and automation studio led by a senior engineer with 15+ years of experience. Based in northern NJ, serving SMBs nationwide.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
