import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle,
  Calendar,
  Check,
  GitBranch,
  Handshake,
  Layers,
  Network,
  RefreshCw,
  Search,
  ShieldCheck,
  Target,
  TrendingUp,
  User,
  UserRound,
  Users,
} from 'lucide-react';
import { Btn } from '@/components/primitives';
import { contactEmail, systemsCallUrl } from '@/lib/site';
import './about-page.css';

const PRINCIPLES = [
  {
    num: '01',
    title: 'Diagnosis before build.',
    body: "We don't scope a project until we understand the operation. Where work stalls, where ownership is unclear, where a single person holds a dependency the organization doesn't know exists. That map comes first. What gets built follows from it.",
    output: 'Output: Diagnostic map',
    image: '/about-principle-01.png',
    alt: 'Whiteboard process map showing operational handoffs and breakpoints',
  },
  {
    num: '02',
    title: 'Infrastructure, not projects.',
    body: "A project ends. Infrastructure runs. The systems we build are designed to operate continuously — not to be handed off and forgotten. Delivery isn't the finish line. A stable, running system is.",
    output: 'Output: Running system',
    image: '/about-principle-02.png',
    alt: 'Hand-drawn current-state workflow on graph paper',
  },
  {
    num: '03',
    title: 'The person who sells the work does the work.',
    body: "No account management layer. No handoff to a team you haven't met. The operator who diagnoses the problem is the one who builds the solution and maintains what's running.",
    output: 'Output: Direct accountability',
    image: '/about-principle-03.png',
    alt: 'Implementation blueprint checklist on clipboard',
  },
] as const;

const BREAKING_POINTS = [
  {
    title: 'Handoff failures',
    body: 'Work moves between people and systems without a clear owner, so delays compound at every transition.',
    Icon: AlertCircle,
  },
  {
    title: 'Manual steps',
    body: 'Critical paths depend on someone remembering to update a spreadsheet, inbox, or shared doc.',
    Icon: UserRound,
  },
  {
    title: 'Reporting gaps',
    body: 'Leadership visibility depends on manual assembly — exports, DMs, and one person who knows where everything lives.',
    Icon: RefreshCw,
  },
] as const;

const WHO_THIS_IS_FOR = [
  'Operations lead or founder in a growing business (10–150 people)',
  'Feeling friction from manual steps, handoffs, or disconnected systems',
  'Ready to invest in infrastructure that creates lasting operational leverage',
  'Values clear diagnosis, honest feedback, and direct execution',
] as const;

const WHAT_WE_LOOK_FOR = [
  {
    title: 'Growth is creating friction',
    body: "You've outgrown ad-hoc processes and the gaps are getting expensive.",
    Icon: TrendingUp,
  },
  {
    title: 'Openness to change',
    body: "You're ready to fix root causes, not just patch symptoms.",
    Icon: GitBranch,
  },
  {
    title: 'Executive alignment',
    body: "There's clarity that this work is a priority.",
    Icon: Users,
  },
] as const;

const HOW_WE_WORK = [
  {
    title: 'Direct collaboration',
    body: 'You work with the people doing the work — no middle layers.',
    Icon: User,
  },
  {
    title: 'Transparent process',
    body: 'Clear diagnostics, shared plans, and visible progress.',
    Icon: Layers,
  },
  {
    title: 'Built for the long run',
    body: 'We design systems that scale with your business.',
    Icon: ShieldCheck,
  },
] as const;

const PROOF_STATS = [
  {
    title: '15+ years building systems',
    body: 'Production infrastructure across companies at different operational scales.',
    Icon: Calendar,
  },
  {
    title: 'Connected operational layers',
    body: 'Workflows, data, reporting, and integrations designed as one environment.',
    Icon: Network,
  },
  {
    title: 'Direct access to the operator',
    body: 'The person in the first conversation is the person doing the work.',
    Icon: Handshake,
  },
  {
    title: 'Systems built for continuity',
    body: 'Infrastructure maintained and evolved as the business scales.',
    Icon: ShieldCheck,
  },
] as const;

export function AboutPageContent() {
  return (
    <main className="about-page min-h-screen pb-[var(--space-page-bottom)]">
      {/* Hero */}
      <section className="about-hero" aria-labelledby="about-hero-heading">
        <div className="about-hero__media" aria-hidden>
          <Image
            src="/about-hero-workspace.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="about-hero__scrim" />
          <div className="about-hero__fade" />
        </div>
        <div className="container">
          <div className="about-hero__copy">
            <p className="about-eyebrow">About IntraWeb</p>
            <h1 id="about-hero-heading">IntraWeb Technologies</h1>
            <p className="about-hero__lead">
              We are a technology partner for small and mid-sized businesses that need to operate at a level the market
              now demands — without the overhead of an enterprise technology department.
            </p>
            <div className="about-hero__actions">
              <Btn variant="primary" href={systemsCallUrl}>
                Book a Systems Call
              </Btn>
              <Link className="about-hero__email" href={`mailto:${contactEmail}`}>
                Email us →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why IntraWeb Exists */}
      <section className="about-section" aria-labelledby="about-origin-heading">
        <div className="container">
          <div className="about-origin__grid">
            <div>
              <p className="about-eyebrow">Why IntraWeb Exists</p>
              <h2 id="about-origin-heading" className="about-origin__headline">
                Small and mid-sized businesses compete in markets shaped by companies with more resources and more
                operational capacity.
              </h2>
              <p>
                Enterprise-grade systems used to require enterprise-level investment. That changed — but building
                operational infrastructure correctly still requires understanding how the business actually runs before
                determining what gets built.
              </p>
              <p>
                IntraWeb was founded to close that gap: giving growing companies access to operational depth designed
                for how they work, maintained as they scale, and built to outlast the engagement that created it.
              </p>
            </div>
            <aside className="about-breaking" aria-labelledby="about-breaking-heading">
              <h3 id="about-breaking-heading">What kept breaking</h3>
              <ul className="about-breaking__list">
                {BREAKING_POINTS.map(({ title, body, Icon }) => (
                  <li key={title} className="about-breaking__item">
                    <span className="about-breaking__icon" aria-hidden>
                      <Icon size={18} strokeWidth={1.75} />
                    </span>
                    <div>
                      <h4>{title}</h4>
                      <p>{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* What IntraWeb Stands For */}
      <section className="about-section" aria-labelledby="about-principles-heading">
        <div className="container">
          <header className="about-principles__header">
            <p className="about-eyebrow">What IntraWeb Stands For</p>
            <h2 id="about-principles-heading">Three principles govern every engagement</h2>
            <p>They aren&apos;t marketing language — they&apos;re the reasons the work holds up.</p>
          </header>
          <div className="about-principles__grid">
            {PRINCIPLES.map(({ num, title, body, output, image, alt }) => (
              <article key={title} className="about-principle-card">
                <div className="about-principle-card__image">
                  <Image src={image} alt={alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                </div>
                <div className="about-principle-card__body">
                  <p className="about-principle-card__num">{num}</p>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <span className="about-principle-card__tag">{output}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Work With — three-column layout */}
      <section className="about-section" aria-labelledby="about-audience-heading">
        <div className="container">
          <p className="about-eyebrow about-eyebrow--rule">Who We Work With</p>
          <div className="about-audience__grid">
            <article className="about-audience-card">
              <div className="about-audience-card__top">
                <div className="about-audience-card__icon" aria-hidden>
                  <User size={22} strokeWidth={1.5} />
                </div>
                <h3 id="about-audience-heading">Who this is for</h3>
                <p className="about-audience-card__intro">
                  We work with operators who are feeling the limits of their current way of working.
                </p>
              </div>
              <ul className="about-audience-card__list about-audience-card__list--checks">
                {WHO_THIS_IS_FOR.map((item) => (
                  <li key={item}>
                    <Check className="about-audience-card__check" size={18} strokeWidth={2.5} aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="about-audience-card">
              <div className="about-audience-card__top">
                <div className="about-audience-card__icon" aria-hidden>
                  <Search size={22} strokeWidth={1.5} />
                </div>
                <h3>What we look for</h3>
                <p className="about-audience-card__intro">
                  A few signals that help us know we can create real impact together.
                </p>
              </div>
              <ul className="about-audience-card__list about-audience-card__list--features">
                {WHAT_WE_LOOK_FOR.map(({ title, body, Icon }) => (
                  <li key={title}>
                    <Icon className="about-audience-card__feature-icon" size={20} strokeWidth={1.5} aria-hidden />
                    <div>
                      <p className="about-audience-card__feature-title">{title}</p>
                      <p className="about-audience-card__feature-body">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className="about-audience-card">
              <div className="about-audience-card__top">
                <div className="about-audience-card__icon" aria-hidden>
                  <Target size={22} strokeWidth={1.5} />
                </div>
                <h3>How we work together</h3>
                <p className="about-audience-card__intro">
                  A working relationship built on clarity, focus, and shared accountability.
                </p>
              </div>
              <ul className="about-audience-card__list about-audience-card__list--features">
                {HOW_WE_WORK.map(({ title, body, Icon }) => (
                  <li key={title}>
                    <Icon className="about-audience-card__feature-icon" size={20} strokeWidth={1.5} aria-hidden />
                    <div>
                      <p className="about-audience-card__feature-title">{title}</p>
                      <p className="about-audience-card__feature-body">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* Proof */}
      <section className="about-section" aria-labelledby="about-proof-heading">
        <div className="container">
          <p className="about-eyebrow">Proof Is In Our Operation</p>
          <h2 id="about-proof-heading" className="sr-only">
            Proof is in our operation
          </h2>
          <div className="about-proof__grid">
            {PROOF_STATS.map(({ title, body, Icon }) => (
              <div key={title} className="about-proof__item">
                <Icon className="about-proof__icon" size={24} strokeWidth={1.5} aria-hidden />
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="about-section about-cta" aria-labelledby="about-cta-heading">
        <div className="container">
          <div className="about-cta__panel">
            <div className="about-cta__content">
              <p className="about-eyebrow">The First Step</p>
              <h2 id="about-cta-heading">
                The first step is understanding exactly where your operation is losing ground.
              </h2>
              <p>
                That&apos;s what the initial conversation is for — not a pitch, not a proposal. A clear diagnostic read on
                what&apos;s breaking and why, whether you engage further or not.
              </p>
              <div className="about-cta__actions">
                <Btn variant="primary" href={systemsCallUrl}>
                  Book a Systems Call
                </Btn>
                <Link className="about-hero__email" href={`mailto:${contactEmail}`}>
                  Or email us directly →
                </Link>
              </div>
            </div>
            <div className="about-cta__media" aria-hidden>
              <Image
                src="/about-cta-notebook.png"
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 45vw"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
