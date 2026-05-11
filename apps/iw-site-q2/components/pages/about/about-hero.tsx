import Image from "next/image";

/** Hero image overlays aligned with `HomeHeroSection` (cool slate wash + floor to `--iw-void`). */
const HERO_IMG_OVERLAY =
  "linear-gradient(105deg, rgba(3,7,12,0.94) 0%, rgba(3,7,12,0.82) 38%, rgba(7,16,25,0.45) 62%, rgba(7,16,25,0.22) 100%)";
const HERO_IMG_FLOOR =
  "linear-gradient(180deg, transparent 38%, rgba(3,7,12,0.45) 68%, rgba(10,10,10,0.92) 88%, #0a0a0a 100%)";

export function AboutHero() {
  return (
    <div className="about-hero relative overflow-hidden">
      <div className="about-container relative z-[1] mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-6 pb-14 pt-6 md:gap-12 md:px-10 md:pb-16 md:pt-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-14 lg:pb-24 lg:pt-10">
        <div className="min-w-0">
          <p className="about-eyebrow">About</p>
          <h1 className="about-hero-title mt-5 max-w-[22ch] text-[clamp(1.85rem,4.5vw,3.35rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-[color:var(--about-text)]">
            Operational systems that connect how a company works to how it scales.
          </h1>
          <p className="about-lede mt-7 max-w-xl text-[17px] leading-[1.55] text-[color:var(--about-text-secondary)] md:text-[19px] md:leading-[1.5]">
            We build the infrastructure, automation, and AI systems that turn operational complexity into clarity.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-7 lg:gap-8">
          <p className="about-hero-copy m-0 space-y-4 text-[16px] leading-[1.65] text-[color:var(--about-text-secondary)] md:text-[17px] md:leading-[1.6] md:space-y-5">
            <span className="block">
              IntraWeb builds integrated operational systems for companies that need their tools, workflows, and people to
              function as one environment.
            </span>
            <span className="block">
              The work sits at the intersection of systems architecture, workflow automation, and AI implementation.
            </span>
          </p>

          <div className="about-hero-visual group relative aspect-[4/3] w-full overflow-hidden rounded-[4px] border border-[color:var(--about-border)] md:aspect-[16/10] lg:min-h-[280px] lg:max-h-[400px]">
            <Image
              src="/hero-01.png"
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover object-center transition-[transform,filter] duration-500 ease-out group-hover:scale-[1.02]"
            />
            <div className="pointer-events-none absolute inset-0" style={{ background: HERO_IMG_OVERLAY }} aria-hidden />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.32] mix-blend-overlay"
              style={{
                backgroundImage: "url(/circuit-pattern.svg)",
                backgroundSize: "520px",
                backgroundPosition: "80% 40%",
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(900px 420px at 80% 20%, rgba(245, 166, 35, 0.07), transparent 55%), radial-gradient(700px 380px at 12% 88%, rgba(36, 56, 74, 0.35), transparent 52%)",
              }}
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-0" style={{ background: HERO_IMG_FLOOR }} aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
