import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CONTACT_INLINE_ERROR,
  articleNotFoundSurface,
  contactConfirmationContent,
  contentUnavailableSurface,
  notFoundSurface,
  privacySurface,
} from "@/content/resilience";

describe("story-first resilience copy", () => {
  it("locks approved contact confirmation strings", () => {
    assert.equal(contactConfirmationContent.title, "Message received.");
    assert.match(
      contactConfirmationContent.body,
      /I’ll review your note and reply if there’s a clear fit/,
    );
  });

  it("locks approved inline contact error", () => {
    assert.equal(
      CONTACT_INLINE_ERROR,
      "Your message could not be sent. Please try again, or email me directly if the issue continues.",
    );
  });

  it("locks approved state headlines", () => {
    assert.equal(notFoundSurface.title, "Page not found.");
    assert.equal(articleNotFoundSurface.title, "Article not found.");
    assert.equal(contentUnavailableSurface.title, "Content unavailable.");
    assert.equal(privacySurface.title, "Privacy.");
  });
});
