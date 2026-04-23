import type { Metadata } from "next";
import { WorkPageContent } from "@/components/pages/work-content";

export const metadata: Metadata = {
  title: "Work | IntraWeb",
  description:
    "Case studies and systems IntraWeb has shipped for SMBs: automation, integrations, and web platforms.",
};

export default function WorkPage() {
  return <WorkPageContent />;
}
