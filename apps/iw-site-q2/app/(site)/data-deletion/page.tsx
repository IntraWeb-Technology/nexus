import type { Metadata } from "next";
import { ContactBlock, LegalPageLayout } from "@/components/legal-page-layout";
import { DataDeletionForm } from "@/components/data-deletion-form";
import { privacyEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "Data Deletion & Privacy Requests",
  description:
    "Request deletion, marketing opt-out, or a copy of your personal data held by IntraWeb Technologies.",
  alternates: {
    canonical: "/data-deletion",
  },
};

export default function DataDeletionPage() {
  return (
    <LegalPageLayout eyebrow="Legal" title="Data Deletion & Privacy Requests" lastUpdated="July 2026">
      <h2 id="your-rights">Your rights</h2>
      <p>
        Depending on your location, you may have the right to access, correct, delete, or receive a portable copy of
        your personal information. You can also object to certain processing or opt out of marketing communications.
      </p>

      <h2 id="what-we-delete">What we delete</h2>
      <p>When you confirm a deletion request, we remove or anonymize data such as:</p>
      <ul>
        <li>Marketing and lead records in our CRM and operational databases</li>
        <li>Client portal profile information and notification preferences</li>
        <li>HubSpot contact records (where legally permitted)</li>
        <li>Authentication accounts linked to your email</li>
      </ul>

      <h2 id="what-we-retain">What we may retain</h2>
      <p>
        We may retain certain records when required by law or for legitimate business purposes, including signed
        contracts, invoices, and engagement documentation for up to <strong>seven years</strong> after services
        complete. Where retention is required, we anonymize personal identifiers where possible.
      </p>

      <h2 id="active-engagements">Active engagements</h2>
      <p>
        If you have an open project, unpaid invoice, or active subscription, automated deletion may be delayed for
        staff review. We will contact you at the email address you provide to resolve billing or project obligations
        before completing erasure.
      </p>

      <h2 id="submit-request">Submit a request</h2>
      <p>
        Enter the email address associated with your relationship with IntraWeb. We will send a confirmation link to
        verify your identity before processing.
      </p>
      <DataDeletionForm />

      <ContactBlock
        heading="Questions about your data?"
        text="Contact our privacy team at"
        email={privacyEmail}
      />
    </LegalPageLayout>
  );
}
