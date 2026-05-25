import Image from "next/image";
import { HomeHeroCopy } from "@/components/sections/home-hero-copy";

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
        <div className="home-hero__ken-burns" style={{ position: "absolute", inset: 0 }}>
          <Image
            src="/hero-01.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            style={{ objectPosition: "center 35%" }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg, rgba(3,7,12,0.94) 0%, rgba(3,7,12,0.82) 38%, rgba(7,16,25,0.45) 62%, rgba(7,16,25,0.22) 100%)",
          }}
        />
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
          <HomeHeroCopy />
        </div>
      </div>
    </section>
  );
}
