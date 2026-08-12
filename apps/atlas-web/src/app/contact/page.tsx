import type { Metadata } from "next";
import { ContactMain } from "@/components/sections/contact-main";
import { getContactContent } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getContactContent();
  return {
    title: data.seo.title,
    description: data.seo.description,
  };
}

export default async function ContactPage() {
  const data = await getContactContent();

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <ContactMain data={data} />
    </main>
  );
}
