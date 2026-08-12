import type { Metadata } from "next";
import { ContactMain } from "@/components/sections/contact-main";
import { contactFixture } from "@/content/contact";

export const metadata: Metadata = {
  title: contactFixture.seo.title,
  description: contactFixture.seo.description,
};

export default function ContactPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <ContactMain data={contactFixture} />
    </main>
  );
}
