import type { Metadata } from "next";
import { ServicesPageContent } from "@/components/pages/services-content";

export const metadata: Metadata = {
  title: {
    absolute: "Services | AI Integration, Workflow Automation & Web Development — IntraWeb",
  },
  description:
    "From AI workflow diagnostics to SaaS product builds, IntraWeb designs and delivers systems that reduce manual work and scale your operations.",
};

export default function ServicesPage() {
  return <ServicesPageContent />;
}
