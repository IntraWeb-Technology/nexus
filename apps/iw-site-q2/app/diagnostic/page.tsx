import type { Metadata } from "next";
import { DiagnosticPageContent } from "@/components/pages/diagnostic-content";

export const metadata: Metadata = {
  title: { absolute: "AI Workflow Diagnostic | IntraWeb" },
  description:
    "The IntraWeb AI Workflow Diagnostic maps your operations, identifies automation opportunities, and delivers a prioritized roadmap you keep.",
};

export default function DiagnosticPage() {
  return <DiagnosticPageContent />;
}
