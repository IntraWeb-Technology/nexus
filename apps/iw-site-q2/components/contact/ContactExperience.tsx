// apps/iw-site-q2/components/contact/ContactExperience.tsx

import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { PageHero } from "@/components/page-hero";
import { ContactPageClient } from "@/components/contact/ContactPageClient";

export function ContactExperience() {
  return (
    <main className="iw-with-bc">
      <BreadcrumbNav
        items={[
          { name: "IntraWeb Technologies", href: "/" },
          { name: "Contact", current: true },
        ]}
      />
      <PageHero
        title={<>Let&apos;s figure out if we&apos;re a fit.</>}
        subhead="IntraWeb takes on a limited number of engagements at a time. Fill out the form and we’ll respond within one business day with either a next step or an honest answer about fit."
      />
      <ContactPageClient />
    </main>
  );
}
