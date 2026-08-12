import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shapePublishingMedia } from "../schemas/publishing.js";

describe("shapePublishingMedia", () => {
  it("normalizes production media with asset", () => {
    const media = shapePublishingMedia(
      {
        alt: "Portfolio OS screenshot",
        kind: "application-screenshot",
        evidenceClass: "production",
        caption: "Homepage hero",
        asset: {
          documentId: "media_1",
          url: "/uploads/hero.webp",
          alternativeText: "Portfolio OS screenshot",
          width: 1440,
          height: 900,
        },
      },
      "https://cms.example.com",
    );

    assert.ok(media);
    assert.equal(media.evidenceClass, "production");
    assert.equal(media.kind, "application-screenshot");
    assert.equal(media.asset?.url, "https://cms.example.com/uploads/hero.webp");
  });

  it("normalizes composed media without asset (A-05 / deferred slots)", () => {
    const media = shapePublishingMedia({
      alt: "Architecture diagram",
      kind: "architecture-diagram",
      evidenceClass: "composed",
      composedKey: "architecture-diagram",
    });

    assert.ok(media);
    assert.equal(media.evidenceClass, "composed");
    assert.equal(media.composedKey, "architecture-diagram");
    assert.equal(media.asset, null);
  });

  it("returns null when required publishing media fields are missing", () => {
    assert.equal(shapePublishingMedia({ alt: "Missing kind" }), null);
  });
});
