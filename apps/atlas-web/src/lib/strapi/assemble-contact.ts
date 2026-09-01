import type { ContactPage } from "@repo/strapi-client";
import type { ContactFixture } from "@/content/contact";
import { contactFixture } from "@/content/contact";

/** CMS ContactPage → ContactFixture domain model. */
export function assembleContact(contact: ContactPage): ContactFixture {
  return {
    seo: {
      title: contact.seo.metaTitle ?? "Contact",
      description: contact.seo.metaDescription ?? "",
    },
    chapter: contact.chapter,
    title: contact.title,
    body: contact.body,
    // ContactPage has no mobile body — preserve Page 28 abbreviation from the fixture.
    bodyMobile: contactFixture.bodyMobile,
    fields: {
      name: { label: contact.nameLabel, placeholder: contact.namePlaceholder },
      email: {
        label: contact.emailLabel,
        placeholder: contact.emailPlaceholder,
      },
      // Context field not yet in Strapi ContactPage — preserve approved fixture copy.
      context: contactFixture.fields.context,
      message: {
        label: contact.messageLabel,
        placeholder: contact.messagePlaceholder,
      },
    },
    submitLabel: contact.submitLabel,
    meta: contact.meta ?? "",
    panels: contactFixture.panels,
    success: {
      title: contact.successTitle,
      body: contact.successBody,
    },
    failure: {
      title: contact.failureTitle,
      body: contact.failureBody,
    },
  };
}
