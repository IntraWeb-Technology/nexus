"use client";

import { Reveal } from "@/components/primitives";
import { MOTION_REVEAL, MOTION_STAGGER } from "@/lib/motion-tokens";

const LINE = "#30363d";
const fadeX = `linear-gradient(to right, transparent 0%, ${LINE} 12%, ${LINE} 88%, transparent 100%)`;

/** Buyer-condition statements — irregular lengths are intentional. */
const statements = [
  "The design is finished. The working product still isn’t.",
  "Two tools should work together, but someone is still moving data by hand.",
  "The software works, but every change feels risky.",
  "It’s running in production, but you’re never completely sure what will break next.",
] as const;

function RecognitionItem({ text, delay, index }: { text: string; delay: number; index: number }) {
  const indent =
    index === 1 ? "md:pl-8 lg:pl-12" : index === 2 ? "md:pl-4 lg:pl-6" : index === 3 ? "md:pl-10 lg:pl-16" : "";

  return (
    <Reveal delay={delay} y={MOTION_REVEAL.y}>
      <p
        className={indent}
        style={{
          margin: 0,
          fontSize: "clamp(1.05rem, 1.35vw, 1.35rem)",
          fontWeight: 500,
          lineHeight: 1.45,
          letterSpacing: "-0.015em",
          color: "#ffffff",
          maxWidth: index === 1 || index === 3 ? "36rem" : "32rem",
        }}
      >
        {text}
      </p>
    </Reveal>
  );
}

/** Client island — staggered Reveal must not cross the RSC boundary. */
export function FrictionGridMotion() {
  return (
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {statements.map((text, i) => (
        <li key={text}>
          {i > 0 ? (
            <div
              className="my-5 md:my-6"
              style={{ height: 1, marginLeft: i % 2 === 0 ? "0%" : "8%", marginRight: "12%", background: fadeX }}
              aria-hidden
            />
          ) : null}
          <RecognitionItem text={text} delay={i * MOTION_STAGGER.lineMs} index={i} />
        </li>
      ))}
    </ul>
  );
}
