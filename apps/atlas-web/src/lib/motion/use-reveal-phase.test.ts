import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classifyRevealEntry } from "./use-reveal-phase.js";

const belowFold = {
  hasEntry: true,
  isIntersecting: false,
  display: "block",
  visibility: "visible",
  rectTop: 2000,
  rectBottom: 2200,
  viewportHeight: 800,
} as const;

const inView = {
  hasEntry: true,
  isIntersecting: true,
  display: "block",
  visibility: "visible",
  rectTop: 40,
  rectBottom: 240,
  viewportHeight: 800,
} as const;

describe("classifyRevealEntry (parent d0044a4 contract)", () => {
  it("SSR/client first below-fold notification is pending for once=true", () => {
    assert.equal(
      classifyRevealEntry({ once: true, alreadyShown: false, ...belowFold }),
      "pending",
    );
  });

  it("first below-fold notification is pending for once=false", () => {
    assert.equal(
      classifyRevealEntry({ once: false, alreadyShown: false, ...belowFold }),
      "pending",
    );
  });

  it("mount snapshot (no IO intersection yet) uses layout rect for in-view shown", () => {
    assert.equal(
      classifyRevealEntry({
        once: true,
        alreadyShown: false,
        ...inView,
        isIntersecting: false,
      }),
      "shown-disconnect",
    );
  });

  it("entering the viewport is shown and disconnects when once=true", () => {
    assert.equal(
      classifyRevealEntry({ once: true, alreadyShown: false, ...inView }),
      "shown-disconnect",
    );
  });

  it("entering the viewport is shown without disconnect when once=false", () => {
    assert.equal(
      classifyRevealEntry({ once: false, alreadyShown: false, ...inView }),
      "shown",
    );
  });

  it("once=true ignores later notifications after shown", () => {
    assert.equal(
      classifyRevealEntry({ once: true, alreadyShown: true, ...belowFold }),
      "ignore",
    );
  });

  it("once=false stays shown after leaving the viewport (does not re-enter pending)", () => {
    assert.equal(
      classifyRevealEntry({ once: false, alreadyShown: true, ...belowFold }),
      "ignore",
    );
  });

  it("once=false re-entering the viewport remains shown", () => {
    assert.equal(
      classifyRevealEntry({ once: false, alreadyShown: true, ...inView }),
      "shown",
    );
  });

  it("hidden breakpoints classify as shown", () => {
    assert.equal(
      classifyRevealEntry({
        once: true,
        alreadyShown: false,
        hasEntry: true,
        isIntersecting: false,
        display: "none",
        visibility: "visible",
        rectTop: 2000,
        rectBottom: 2200,
        viewportHeight: 800,
      }),
      "shown",
    );
  });
});
