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
      }}
    >
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
