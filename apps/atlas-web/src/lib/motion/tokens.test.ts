import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { motionDistances, motionDurations, motionEasings } from "./tokens.js";

describe("motion tokens", () => {
  it("exports durations matching the motion system spec", () => {
    assert.deepEqual(motionDurations, {
      instant: 80,
      fast: 140,
      base: 200,
      slow: 320,
      page: 420,
    });
  });

  it("exports easings matching the motion system spec", () => {
    assert.equal(motionEasings.standard, "cubic-bezier(0.2, 0, 0, 1)");
    assert.equal(motionEasings.out, "cubic-bezier(0.16, 1, 0.3, 1)");
    assert.equal(motionEasings.inOut, "cubic-bezier(0.65, 0, 0.35, 1)");
  });

  it("exports distances matching the motion system spec", () => {
    assert.deepEqual(motionDistances, { xs: 4, sm: 8, md: 16 });
  });
});
