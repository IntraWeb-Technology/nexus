import Image from "next/image";
import Link from "next/link";
import { Btn } from "@/components/primitives";
import { systemsCallUrl } from "@/lib/site";

export function HomeHeroSection() {
  return (
    <section
      id="top"
      aria-labelledby="home-hero-heading"
      style={{
        position: "relative",
        minHeight: "min(80vh, 720px)",
        paddingTop: 0,
        paddingBottom: 0,
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        <Image
          src="/hero-01.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          style={{ objectPosition: "center 35%" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg, rgba(3,7,12,0.94) 0%, rgba(3,7,12,0.82) 38%, rgba(7,16,25,0.45) 62%, rgba(7,16,25,0.22) 100%)",
          }}
        />
        {/* Bottom fade: cool neutrals only — ends at #0a0a0a to match Friction section (no warm cast). */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, transparent 38%, rgba(3,7,12,0.45) 68%, rgba(10,10,10,0.92) 88%, #0a0a0a 100%)",
          }}
        />
      </div>

      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 2,
          paddingTop: "calc(var(--space-hero-pt) + 60px)",
          paddingBottom: 40,
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "clamp(2rem, 5vw, 3.5rem)",
            alignItems: "end",
            maxWidth: "min(1120px, 100%)",
          }}
        >
          <div style={{ maxWidth: "min(640px, 100%)", paddingBottom: "0.5rem" }}>
            <p
              className="mono"
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--accent)",
                fontWeight: 600,
                marginBottom: "1rem",
              }}
            >
              Operational infrastructure. Real results.
            </p>
            <h1
              id="home-hero-heading"
              style={{
                fontSize: "clamp(2rem, 4.2vw, 3.05rem)",
                lineHeight: 1.12,
                fontWeight: 650,
                color: "var(--iw-fg)",
                marginBottom: "1.25rem",
              }}
            >
              We build the operational infrastructure that connects how you work to how you scale.
            </h1>
            <p
              style={{
                fontSize: "clamp(1rem, 1.15vw, 1.125rem)",
                lineHeight: 1.65,
                color: "var(--iw-fg-1)",
                marginBottom: "2rem",
              }}
            >
              We remove workflow friction, eliminate operational inefficiency, and connect your systems so your organization can operate with clarity and scale without adding headcount.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "14px 20px",
              }}
            >
              <Btn variant="primary" href={systemsCallUrl}>
                Book a Systems Call
              </Btn>
              <Link
                href="/#model"
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--accent)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                See How We Work <span aria-hidden>↓</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
