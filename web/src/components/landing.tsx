import Link from "next/link";
import {
  Map,
  Zap,
  Users,
  Sprout,
  Award,
  GraduationCap,
  Database,
  Radar,
  TrendingUp,
  Eye,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { label: "Services", href: "#services" },
  { label: "Why us", href: "#why" },
  { label: "Clients", href: "#clients" },
  { label: "Contact", href: "#contact" },
] as const;

const SERVICES = [
  {
    icon: Map,
    title: "Aerial mapping",
    desc: "Orthomosaics, 3D models, DSM & DTM at engineering-grade accuracy.",
  },
  {
    icon: Sprout,
    title: "Precision agriculture",
    desc: "NDVI/NDRE/NDWI crop health mapping and autonomous drone spraying.",
  },
  {
    icon: Award,
    title: "Pilot licensing (RPL)",
    desc: "MCAA-compliant Remote Pilot Licenses in partnership with SH Aviation.",
  },
  {
    icon: GraduationCap,
    title: "Advanced training",
    desc: "EVLOS/BVLOS, RTK/PPK workflows, Pix4D & DJI Terra field courses.",
  },
  {
    icon: Zap,
    title: "STEM education",
    desc: "Hands-on coding and drone fundamentals for young Malawian learners.",
  },
  {
    icon: Database,
    title: "GeoPortal",
    desc: "National geospatial data platform — centralized, secure & coming soon.",
  },
];

const WHY = [
  {
    title: "Precision",
    desc: "Engineering-grade accuracy aligned with global standards.",
    icon: Radar,
  },
  {
    title: "Cost-effective",
    desc: "Reduce fieldwork and labor costs through data-driven operations.",
    icon: TrendingUp,
  },
  {
    title: "Expertise",
    desc: "Certified pilots, GIS analysts, engineers, and scientists.",
    icon: Users,
  },
  {
    title: "Safety",
    desc: "Remote capture in hazardous or hard-to-reach environments.",
    icon: Eye,
  },
  {
    title: "Speed",
    desc: "Fast turnaround with scalable, high-efficiency drone fleets.",
    icon: Zap,
  },
];

const CLIENTS = [
  "UNICEF",
  "World Bank",
  "ESCOM",
  "Illovo Sugar",
  "SH Aviation",
  "Swoop Aero",
  "TACE",
  "MRA",
  "Malawi Govt",
  "LUANAR",
  "ARISE",
  "GLOBHE",
  "Twilio",
  "TG Enterprises",
  "Wellcome Programme",
  "PRIDE",
];

const STATS = [
  { value: "120+", label: "Surveys completed" },
  { value: "50,000+", label: "Hectares mapped" },
  { value: "80+", label: "Pilots trained" },
  { value: "20+", label: "Enterprise clients" },
] as const;

export function Landing() {
  return (
    <div
      className="min-h-screen overflow-x-hidden text-[var(--text)]"
      style={{ background: "var(--deep)" }}
    >
      <header
        className="sticky top-0 z-[100] border-b border-[var(--border)] backdrop-blur-xl"
        style={{ background: "var(--header-bg)" }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#" className="flex shrink-0 items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-[0_6px_24px_var(--accent-glow)]"
              style={{ background: "var(--accent)" }}
            >
              <Radar size={22} className="text-[#0a0a0a]" aria-hidden />
            </div>
            <div className="leading-tight">
              <span className="display block text-lg font-semibold tracking-tight sm:text-xl">
                CAGE<span className="text-[var(--accent)]"> Drones</span>
              </span>
              <span className="hidden text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)] sm:block">
                &amp; Data
              </span>
            </div>
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted2)] transition-colors hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)] hover:text-[var(--text)]"
              >
                {item.label}
              </a>
            ))}
            <ThemeToggle />
            <Link
              href="/register"
              className="ml-2 inline-flex items-center rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--muted2)] transition-colors hover-accent-dim hover:text-[var(--text)]"
            >
              Register
            </Link>
            <Link
              href="/login"
              className="btn-primary ml-2 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm"
            >
              Sign in
              <ChevronRight size={16} aria-hidden />
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Link
              href="/register"
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--muted2)]"
            >
              Register
            </Link>
            <Link
              href="/login"
              className="btn-primary rounded-lg px-3 py-2 text-xs font-semibold"
            >
              Sign in
            </Link>
            <details className="landing-mobile-nav relative">
              <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--muted2)] transition-colors hover-accent-dim hover:text-[var(--text)] [&::-webkit-details-marker]:hidden">
                <Menu size={20} className="landing-nav-menu" aria-hidden />
                <X size={20} className="landing-nav-close" aria-hidden />
                <span className="sr-only">Menu</span>
              </summary>
              <div
                className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,280px)] rounded-xl border border-[var(--border)] p-2 shadow-2xl"
                style={{ background: "var(--surface)" }}
              >
                {NAV.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="block rounded-lg px-4 py-3 text-sm font-medium text-[var(--muted2)] hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)] hover:text-[var(--text)]"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </details>
          </div>
        </div>
      </header>

      <section
        className="mesh-hero relative isolate flex min-h-[min(92vh,880px)] flex-col justify-center overflow-hidden px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:pb-28"
        aria-labelledby="hero-heading"
      >
        <div
          className="landing-glow-orb -right-20 top-1/4 h-[380px] w-[380px] opacity-[0.35] sm:right-0"
          style={{ background: "var(--accent-glow)" }}
          aria-hidden
        />
        <div
          className="landing-glow-orb -left-32 bottom-0 h-[280px] w-[280px] opacity-25"
          style={{ background: "color-mix(in srgb, var(--accent) 40%, transparent)" }}
          aria-hidden
        />

        <div className="relative mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1fr_minmax(0,420px)] lg:items-center lg:gap-16">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-4 py-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Malawi&apos;s drone &amp; geospatial partner
            </p>
            <h1
              id="hero-heading"
              className="display mb-6 max-w-[20ch] text-4xl font-semibold leading-[1.12] tracking-tight sm:max-w-none sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]"
            >
              Fly smarter.{" "}
              <span className="text-gradient-accent">Map better.</span>
              <br />
              Grow faster.
            </h1>
            <p className="mb-10 max-w-xl text-base leading-relaxed text-[var(--muted2)] sm:text-lg">
              End-to-end aerial surveys, precision agriculture, pilot licensing, and
              geospatial intelligence — built for Malawi, scaled for southern Africa.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <a
                href="#contact"
                className="btn-primary inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base shadow-[0_8px_28px_var(--accent-glow)]"
              >
                Get a quote
                <ChevronRight size={18} aria-hidden />
              </a>
              <Link
                href="/login"
                className="btn-outline inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="relative lg:justify-self-end">
            <div
              className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8"
              style={{
                boxShadow:
                  "0 24px 64px rgba(0,0,0,.12), inset 0 1px 0 color-mix(in srgb, var(--text) 6%, transparent)",
              }}
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl"
                style={{ background: "color-mix(in srgb, var(--accent) 18%, transparent)" }}
                aria-hidden
              />
              <p className="relative mb-6 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Impact at a glance
              </p>
              <dl className="relative grid grid-cols-2 gap-5 sm:gap-6">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,var(--accent)_12%)] px-4 py-4 sm:px-5 sm:py-5"
                  >
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="display text-2xl font-semibold text-[var(--accent)] sm:text-3xl">
                      {s.value}
                    </dd>
                    <dd className="mt-1 text-xs font-medium leading-snug text-[var(--muted2)] sm:text-sm">
                      {s.label}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="relative mt-6 border-t border-[var(--border)] pt-6 text-sm leading-relaxed text-[var(--muted2)]">
                From humanitarian mapping to commercial pipelines — one team for capture,
                processing, and insight.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="services"
        className="scroll-mt-20 border-t border-[var(--border)] px-4 py-20 sm:px-6 sm:py-28"
        style={{
          background:
            "linear-gradient(180deg, var(--deep) 0%, rgba(11,18,35,.5) 50%, var(--deep) 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 max-w-2xl">
            <p className="mb-3 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              What we do
            </p>
            <h2 className="display text-3xl font-semibold tracking-tight sm:text-4xl">
              Services across the full aerial stack
            </h2>
            <p className="mt-4 text-[var(--muted2)]">
              Survey-grade capture, agronomic analytics, regulated training, and platforms
              — coordinated under one roof.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {SERVICES.map((s) => (
              <article key={s.title} className="card-service rounded-2xl p-6 sm:p-7">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]">
                  <s.icon size={22} className="text-[var(--accent)]" strokeWidth={1.5} aria-hidden />
                </div>
                <h3 className="display mb-2 text-lg font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--muted2)]">{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="why"
        className="scroll-mt-20 border-t border-[var(--border)] px-4 py-20 sm:px-6 sm:py-28"
        style={{ background: "var(--surface)" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Why CAGE
            </p>
            <h2 className="display text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for real-world operations
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[var(--muted2)]">
              We combine aviation discipline, GIS rigor, and local context so your projects
              land on time and on spec.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {WHY.map((w) => (
              <li
                key={w.title}
                className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center transition-colors hover-accent-dim"
              >
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]"
                  aria-hidden
                >
                  <w.icon size={22} className="text-[var(--accent)]" strokeWidth={1.5} />
                </div>
                <span className="display text-base font-semibold">{w.title}</span>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted2)]">{w.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="clients"
        className="scroll-mt-20 border-y border-[var(--border)] px-4 py-16 sm:px-6 sm:py-20"
        style={{ background: "var(--deep)" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Trusted by
            </p>
            <h2 className="display mt-2 text-xl font-semibold text-[var(--text)] sm:text-2xl">
              Institutions &amp; enterprises across the region
            </h2>
          </div>
          <ul className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
            {CLIENTS.map((name) => (
              <li key={name}>
                <span className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 font-body text-[11px] font-medium uppercase tracking-wider text-[var(--muted2)] sm:text-xs">
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-20 relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_100%,var(--accent-glow),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="display text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to take flight?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--muted2)]">
            Whether you need aerial surveys, precision ag data, or drone training — CAGE
            delivers from sky to screen.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3 sm:gap-4">
            <a
              href="https://www.cagemw.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 rounded-xl px-8 py-3.5"
            >
              Contact via website
              <ChevronRight size={18} aria-hidden />
            </a>
            <Link href="/login" className="btn-outline inline-flex rounded-xl px-8 py-3.5">
              Sign in
            </Link>
          </div>
          <p className="mt-6 text-sm text-[var(--muted)]">
            Share your sector and timeline on the main site — we&apos;ll connect you with
            the right team.
          </p>
        </div>
      </section>

      <footer
        className="border-t border-[var(--border)] px-4 py-12 sm:px-6"
        style={{ background: "var(--surface)" }}
      >
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ background: "var(--accent)" }}
              >
                <Radar size={18} className="text-[#0a0a0a]" aria-hidden />
              </div>
              <span className="display text-lg font-semibold">CAGE Drones &amp; Data</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted2)]">
              Aerial intelligence and training from Malawi — surveys, agriculture, licensing,
              and education.
            </p>
          </div>
          <div>
            <p className="mb-3 font-body text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
              Navigate
            </p>
            <ul className="space-y-2 text-sm text-[var(--muted2)]">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition-colors hover:text-[var(--accent)]">
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/register" className="transition-colors hover:text-[var(--accent)]">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-[var(--accent)]">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-body text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
              Online
            </p>
            <p className="text-sm text-[var(--muted2)]">
              <a
                href="https://www.cagemw.com"
                className="text-[var(--text)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.cagemw.com
              </a>
            </p>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-col items-start justify-between gap-4 border-t border-[var(--border)] pt-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} CAGE MW. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
