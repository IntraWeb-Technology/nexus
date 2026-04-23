import type { Metadata } from "next";
import { ContactPageContent } from "@/components/pages/contact-content";

export const metadata: Metadata = {
  title: { absolute: "Contact IntraWeb | Start a Project or Book a Diagnostic" },
  description:
    "Ready to automate your operations or build your next web system? Contact IntraWeb to start the conversation.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
