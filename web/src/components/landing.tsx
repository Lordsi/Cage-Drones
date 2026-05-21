import Link from "next/link";
import {
  Menu,
  X,
  Shield,
  Map,
  GraduationCap,
  Clock,
  BarChart3,
  Calendar,
  MapPin,
  Wrench,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocationMap } from "@/components/location-map";
import { EnrollmentForm } from "@/components/enrollment-form";

const NAV = [
  { label: "Services", href: "#services" },
  { label: "Training", href: "#training", active: true },
  { label: "Fleet", href: "#technology" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#enroll-form" },
] as const;

const SERVICES = [
  {
    title: "Remote Pilot License (RePL)",
    desc: "The foundational certification required for commercial drone operations. Covers air law, flight theory, and practical flight assessment to CASA standards.",
    icon: GraduationCap,
    level: "Entry Level",
    duration: "5 Days",
    difficulty: "Beginner",
    price: "$1,950",
    layout: "primary" as const,
  },
  {
    title: "Specialized Mapping",
    desc: "Advanced photogrammetry and LiDAR data acquisition techniques for high-precision surveying and digital twin creation.",
    icon: Map,
    level: "Specialist",
    duration: "3 Days",
    difficulty: "Intermediate",
    price: "$1,400",
    layout: "outline" as const,
  },
  {
    title: "Advanced Inspection Training",
    desc: "Master the complexities of critical infrastructure inspection. Training includes thermal imaging, structural analysis, and close-proximity flight in high-interference environments (Bridges, Turbines, Cell Towers).",
    icon: Wrench,
    level: "Advanced",
    price: "$2,850",
    layout: "dark" as const,
  },
];

const EXPERIENCE = [
  {
    client: "Illovo Sugar Malawi",
    scope: "RPL Training & DJI M350 RTK Familiarization",
    detail: "17 staff trained for Remote Pilot Licenses. Hands-on DJI Matrice 350 RTK training at Nchalo and Dwangwa estates.",
  },
  {
    client: "UNICEF Malawi",
    scope: "Flood Resilience Mapping — Rukuru River",
    detail: "~19,700 hectares of high-resolution aerial mapping. 5 cm orthomosaics, DSM/DTM generation, and GIS-integrated flood modeling.",
  },
  {
    client: "SMEC",
    scope: "Lower Domasi Dam Feasibility Study",
    detail: "~1,207 hectares surveyed using DJI M300 RTK + LiDAR. Deliverables: 4.56 cm orthomosaics, digital elevation models.",
  },
  {
    client: "ESCOM Malawi",
    scope: "Drone Training & Utility Mapping",
    detail: "48 engineers across a 3-week RPL program and 1-week advanced mapping course. LiDAR corridor modeling, thermal applications.",
  },
  {
    client: "Waterboard — Southern Regions",
    scope: "Thermal Leak Detection Training",
    detail: "Specialized drone training for Blantyre and Southern Region Waterboards using thermal drones to detect water leakages.",
  },
  {
    client: "Paramount Holdings / Salima Sugar",
    scope: "Precision Aerial Spraying",
    detail: "Estate-scale precision spraying of urea fertilizer on sugarcane using the DJI Agras T50.",
  },
];

const SCHEDULE = [
  { id: "REPL-2410", cert: "RePL Multi-Rotor (<7kg)", location: "Sydney Training Center", date: "Oct 14–18", status: "open" as const },
  { id: "MAP-2411", cert: "Specialized Mapping", location: "Brisbane Field Site", date: "Nov 02–04", status: "waitlist" as const },
  { id: "INS-2411", cert: "Advanced Inspection", location: "Melbourne HQ", date: "Nov 15–19", status: "open" as const },
];

const STATS = [
  { value: "120+", label: "Surveys completed" },
  { value: "50k+", label: "Hectares mapped" },
  { value: "80+", label: "Pilots trained" },
  { value: "20+", label: "Enterprise clients" },
] as const;

const TEAM = [
  "Ndapile Mkuwu",
  "Comfort Mwenje",
  "Ian Mtika",
  "Alexander Dc Mtambo",
  "Mayamiko Ndala",
];

const TECH = [
  "DJI Matrice 300 RTK", "DJI Mavic 3 Multispectral", "DJI Mavic 3 Enterprise",
  "DJI Mavic 3 Thermal", "DJI Agras T50", "Zenmuse L1 LiDAR",
  "Pix4Dmapper", "Pix4Dfields", "DJI Terra", "QGIS", "AutoCAD",
];

interface LandingProps {
  auth?: {
    displayName: string;
    roleLabel: string;
    dashboardHref: string;
  } | null;
}

export function Landing({ auth }: LandingProps) {
  return (
    <div className="landing">
      {/* ── Top Navigation ── */}
      <header className="landing-header">
        <div className="landing-container landing-header-inner">
          <div className="flex items-center gap-2">
            <a href="#" className="landing-logo">
              <span className="landing-logo-mark">CAGE</span>
            </a>
          </div>

          <nav className="landing-nav-desktop" aria-label="Primary">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="landing-nav-link"
                data-active={"active" in item && item.active ? "true" : undefined}
              >
                {item.label}
              </a>
            ))}
            <ThemeToggle />
            {auth ? (
              <Link href={auth.dashboardHref} className="landing-nav-signin">
                {auth.displayName}
              </Link>
            ) : (
              <Link href="/login" className="landing-nav-signin">
                Launch Portal
              </Link>
            )}
          </nav>

          <div className="landing-nav-mobile">
            <ThemeToggle />
            {auth ? (
              <Link href={auth.dashboardHref} className="landing-nav-signin">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="landing-nav-signin">
                Portal
              </Link>
            )}
            <details className="landing-mobile-nav">
              <summary className="landing-menu-btn">
                <Menu size={20} className="landing-nav-menu" aria-hidden />
                <X size={20} className="landing-nav-close" aria-hidden />
                <span className="sr-only">Menu</span>
              </summary>
              <div className="landing-mobile-dropdown">
                {NAV.map((item) => (
                  <a key={item.href} href={item.href} className="landing-mobile-link">
                    {item.label}
                  </a>
                ))}
                <Link href="/register" className="landing-mobile-link">
                  Register
                </Link>
              </div>
            </details>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="landing-hero" aria-labelledby="hero-heading">
        <div className="landing-container">
          <div className="landing-hero-card">
            <div className="landing-hero-text">
              <p className="landing-eyebrow">Aviation Excellence</p>
              <h1 id="hero-heading" className="landing-h1">
                Precision-Driven Drone Training
              </h1>
              <p className="landing-hero-sub">
                Elevate your operational capabilities with CAGE&apos;s industry-leading
                certification programs. From foundational licensing to specialized
                industrial inspection.
              </p>
              <div className="landing-hero-actions">
                <a href="#training" className="landing-btn-primary">
                  View Schedule
                </a>
                <Link href="/register" className="landing-btn-secondary">
                  Course Guide
                </Link>
              </div>
            </div>

            <div
              className="landing-hero-image"
              style={{ backgroundImage: "url(/images/hero-training.jpg)" }}
              role="img"
              aria-label="Professional drone pilot instructor guiding a student in an outdoor training environment"
            />
          </div>

          <dl className="landing-stats">
            {STATS.map((s) => (
              <div key={s.label} className="landing-stat">
                <dd className="landing-stat-value">{s.value}</dd>
                <dt className="landing-stat-label">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Certification Programs (Bento) ── */}
      <section id="services" className="landing-section">
        <div className="landing-container">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="landing-h2" style={{ marginBottom: "0.25rem" }}>Certification Programs</h2>
              <p className="landing-body">Select a specialized pathway to professional mastery.</p>
            </div>
          </div>
          <div className="landing-services-grid">
            {/* Course 1: RePL — 7 col */}
            <div className="landing-service">
              <div>
                <div className="mb-6 flex justify-between items-start">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--accent) 8%, transparent)" }}>
                    <GraduationCap size={24} style={{ color: "var(--accent)" }} strokeWidth={1.5} />
                  </div>
                  <span className="badge badge-cyan">{SERVICES[0].level}</span>
                </div>
                <h3 className="landing-service-title">{SERVICES[0].title}</h3>
                <p className="landing-service-desc mb-6">{SERVICES[0].desc}</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="landing-service-meta">
                    <Clock size={16} className="landing-service-meta-icon" />
                    <span>{SERVICES[0].duration}</span>
                  </div>
                  <div className="landing-service-meta">
                    <BarChart3 size={16} className="landing-service-meta-icon" />
                    <span>{SERVICES[0].difficulty}</span>
                  </div>
                </div>
              </div>
              <a href="#enroll-form?course=repl" className="landing-service-enroll primary">
                Enroll Now — {SERVICES[0].price}
              </a>
            </div>

            {/* Course 2: Mapping — 5 col */}
            <div className="landing-service">
              <div>
                <div className="mb-6 flex justify-between items-start">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--accent) 8%, transparent)" }}>
                    <Map size={24} style={{ color: "var(--accent)" }} strokeWidth={1.5} />
                  </div>
                  <span className="badge badge-cyan">{SERVICES[1].level}</span>
                </div>
                <h3 className="landing-service-title">{SERVICES[1].title}</h3>
                <p className="landing-service-desc mb-6">{SERVICES[1].desc}</p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--border)" }}>
                    <span style={{ color: "var(--muted)" }}>Duration</span>
                    <span className="landing-service-meta">{SERVICES[1].duration}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--border)" }}>
                    <span style={{ color: "var(--muted)" }}>Difficulty</span>
                    <span className="landing-service-meta">{SERVICES[1].difficulty}</span>
                  </div>
                </div>
              </div>
              <a href="#enroll-form?course=mapping" className="landing-service-enroll outline">
                Enroll Now — {SERVICES[1].price}
              </a>
            </div>

            {/* Course 3: Advanced Inspection — full width */}
            <div className="landing-service">
              <div className="landing-bento-full">
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--accent) 8%, transparent)" }}>
                      <Wrench size={24} style={{ color: "var(--accent)" }} strokeWidth={1.5} />
                    </div>
                    <h3 className="landing-service-title" style={{ margin: 0 }}>{SERVICES[2].title}</h3>
                  </div>
                  <p className="landing-service-desc mb-6">{SERVICES[2].desc}</p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: "var(--surface)" }}>
                      <Calendar size={16} style={{ color: "var(--accent)" }} />
                      <span className="landing-service-meta">Oct 24, 2024</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: "var(--surface)" }}>
                      <MapPin size={16} style={{ color: "var(--accent)" }} />
                      <span className="landing-service-meta">Headquarters</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-start md:items-end">
                  <div className="md:text-right mb-6">
                    <div className="landing-service-meta mb-1">Program Fee</div>
                    <div className="landing-price-display">{SERVICES[2].price}</div>
                  </div>
                  <a href="#enroll-form?course=inspection" className="landing-service-enroll dark w-full md:w-auto" style={{ padding: "1rem 3rem" }}>
                    Secure Enrollment
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Training Schedule Table ── */}
      <section id="training" className="landing-section landing-section-alt">
        <div className="landing-container">
          <div className="landing-schedule-card">
            <div className="landing-schedule-header">
              <h3 className="landing-h2" style={{ margin: 0 }}>Training Schedule</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead style={{ background: "var(--surface)" }}>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>Course ID</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>Certification</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>Location</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>Date</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {SCHEDULE.map((row) => (
                    <tr key={row.id} className="group transition-colors" style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="px-6 py-4 font-medium" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>{row.id}</td>
                      <td className="px-6 py-4 font-bold" style={{ color: "var(--text)" }}>{row.cert}</td>
                      <td className="px-6 py-4" style={{ color: "var(--muted)" }}>{row.location}</td>
                      <td className="px-6 py-4" style={{ color: "var(--muted)" }}>{row.date}</td>
                      <td className="px-6 py-4">
                        <span
                          className="px-2 py-1 rounded text-xs font-bold uppercase"
                          style={{
                            background: row.status === "open" ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "color-mix(in srgb, var(--red) 10%, transparent)",
                            color: row.status === "open" ? "var(--accent)" : "var(--red)",
                          }}
                        >
                          {row.status === "open" ? "Open" : "Waitlist"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-sm font-semibold uppercase opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--accent)" }}>
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── Experience / Track Record ── */}
      <section id="experience" className="landing-section">
        <div className="landing-container">
          <p className="landing-eyebrow">Track Record</p>
          <h2 className="landing-h2">Selected projects</h2>
          <div className="landing-experience-list">
            {EXPERIENCE.map((e) => (
              <article key={e.scope} className="landing-exp-item">
                <div className="landing-exp-left">
                  <span className="landing-exp-client">{e.client}</span>
                  <h3 className="landing-exp-scope">{e.scope}</h3>
                </div>
                <p className="landing-exp-detail">{e.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technology / Fleet ── */}
      <section id="technology" className="landing-section landing-section-alt">
        <div className="landing-container">
          <p className="landing-eyebrow">Technology</p>
          <h2 className="landing-h2">Platforms & tools</h2>
          <p className="landing-body" style={{ maxWidth: "42rem" }}>
            We deploy a curated portfolio of aerial platforms, sensors, and analytical
            software — selected for reliability, scalability, and compliance with
            professional operational standards.
          </p>
          <div className="landing-tech-list">
            {TECH.map((t) => (
              <span key={t} className="landing-tech-tag">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="landing-section">
        <div className="landing-container">
          <div className="landing-about-grid">
            <div>
              <p className="landing-eyebrow">About</p>
              <h2 className="landing-h2">Why CAGE</h2>
              <div className="landing-about-points">
                <div>
                  <h4 className="landing-point-title">Precision</h4>
                  <p className="landing-point-desc">Engineering-grade accuracy aligned with global surveying standards.</p>
                </div>
                <div>
                  <h4 className="landing-point-title">Cost-effective</h4>
                  <p className="landing-point-desc">Reduced fieldwork and labor costs through efficient, data-driven operations.</p>
                </div>
                <div>
                  <h4 className="landing-point-title">Expertise</h4>
                  <p className="landing-point-desc">Certified pilots, GIS analysts, engineers, agronomists, and accredited RPL instructors.</p>
                </div>
                <div>
                  <h4 className="landing-point-title">Safety</h4>
                  <p className="landing-point-desc">Remote data capture in hazardous or hard-to-reach environments, minimizing risk.</p>
                </div>
              </div>
            </div>

            <div>
              <p className="landing-eyebrow">Vision</p>
              <p className="landing-body">
                To become southern Africa&apos;s leading drone implementation partner — known
                for regulatory excellence, hands-on training, and scalable innovation from
                enterprise to education.
              </p>

              <p className="landing-eyebrow" style={{ marginTop: "2rem" }}>Mission</p>
              <p className="landing-body">
                To equip Malawi&apos;s public and private sectors with the tools, knowledge,
                and operational structure needed to deploy drone technology safely,
                profitably, and at scale.
              </p>

              <p className="landing-eyebrow" style={{ marginTop: "2rem" }}>Team</p>
              <ul className="landing-team-list">
                {TEAM.map((name) => (
                  <li key={name} className="landing-team-name">{name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact / Initiate Mission Support ── */}
      <section id="enroll-form" className="landing-section landing-section-alt">
        <div className="landing-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Contact Form */}
            <div className="lg:col-span-7 p-8 rounded-lg" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <EnrollmentForm />
            </div>

            {/* Information Sidebar */}
            <aside className="lg:col-span-5 space-y-6">
              {/* Map Card */}
              <div className="rounded-lg overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <LocationMap />
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>Global Operations HQ</h3>
                  <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                    Lilongwe, Malawi<br />
                    Area 47 Sector 2
                  </p>
                  <a
                    href="https://www.google.com/maps?q=-13.9626,33.7741"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                    style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 500 }}
                  >
                    <MapPin size={14} />
                    <span>GET DIRECTIONS</span>
                  </a>
                </div>
              </div>

              {/* Contact Methods */}
              <div className="rounded-lg p-6 space-y-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)" }}>
                    <Shield size={20} style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold" style={{ color: "var(--text)" }}>Priority Support</h4>
                    <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>Direct access to our technical support team.</p>
                    <a className="text-xs font-medium tracking-wide" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }} href="mailto:info@cagemw.com">INFO@CAGEMW.COM</a>
                  </div>
                </div>
                <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>Flight Status</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: "var(--green)" }} />
                      <span className="text-xs font-semibold" style={{ color: "var(--green)", fontFamily: "var(--font-mono)" }}>ALL SYSTEMS OPERATIONAL</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Training Center Highlight */}
              <div className="rounded-lg p-6 relative overflow-hidden" style={{ background: "var(--nav-dark)", color: "var(--text)" }}>
                <div className="relative z-10">
                  <h4 className="text-lg font-semibold mb-2">Technical Training</h4>
                  <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                    Our specialized training facility is open for private academy sessions and corporate certifications.
                  </p>
                  <Link href="/login" className="landing-btn-primary" style={{ display: "inline-flex" }}>
                    View Calendar
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div className="landing-footer-top">
            <div className="landing-footer-left">
              <span className="landing-footer-brand">CAGE</span>
              <p className="landing-footer-desc">
                Pioneering professional drone services and
                elite pilot training for industry leaders.
              </p>
            </div>
            <nav className="landing-footer-nav">
              <a href="https://www.cagemw.com" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              <a href="https://www.cagemw.com" target="_blank" rel="noopener noreferrer">Terms of Service</a>
              <a href="https://www.cagemw.com" target="_blank" rel="noopener noreferrer">Safety Protocols</a>
              <a href="https://www.cagemw.com" target="_blank" rel="noopener noreferrer">Careers</a>
              <Link href="/login" className="highlight">Pilot Portal</Link>
            </nav>
          </div>
          <p className="landing-footer-copy">
            © {new Date().getFullYear()} CAGE Drone Services & Training. All rights reserved. Precision in Flight.
          </p>
        </div>
      </footer>
    </div>
  );
}
