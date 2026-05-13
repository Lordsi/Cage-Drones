import Link from "next/link";
import {
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { label: "Services", href: "#services" },
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

const SERVICES = [
  {
    title: "Aerial Mapping & Surveys",
    desc: "High-accuracy orthomosaics, 3D models, DSM/DTM, contour maps, and CAD/GIS-ready datasets using RTK-enabled platforms and LiDAR payloads.",
  },
  {
    title: "Precision Agriculture",
    desc: "NDVI, NDRE, and NDWI crop health analysis plus drone-based spraying of fertilizers, herbicides, and pesticides using the DJI Agras T50.",
  },
  {
    title: "Remote Pilot Licensing",
    desc: "MCAA-compliant RPL training — air law, meteorology, navigation, flight planning, and practical operations. In partnership with SH Aviation.",
  },
  {
    title: "Advanced Training",
    desc: "Industry-specific courses: EVLOS/BVLOS operations, RTK/PPK workflows, multispectral & thermal analysis, Pix4D and DJI Terra data processing.",
  },
  {
    title: "STEM Education",
    desc: "Hands-on programs introducing young learners to coding fundamentals, drone safety, flight control, and real-world UAV applications.",
  },
  {
    title: "GeoPortal",
    desc: "A national-level geospatial data platform with secure, role-based access integrating drone-collected data for evidence-based decisions. Coming soon.",
  },
];

const EXPERIENCE = [
  {
    client: "Illovo Sugar Malawi",
    scope: "RPL Training & DJI M350 RTK Familiarization",
    detail: "17 staff trained for Remote Pilot Licenses. Hands-on DJI Matrice 350 RTK training at Nchalo and Dwangwa estates — land mapping, crop scouting, terrain modeling.",
  },
  {
    client: "UNICEF Malawi",
    scope: "Flood Resilience Mapping — Rukuru River",
    detail: "~19,700 hectares of high-resolution aerial mapping. 5 cm orthomosaics, DSM/DTM generation, and GIS-integrated flood modeling support.",
  },
  {
    client: "SMEC",
    scope: "Lower Domasi Dam Feasibility Study",
    detail: "~1,207 hectares surveyed using DJI M300 RTK + LiDAR. Deliverables: 4.56 cm orthomosaics, digital elevation models, 0.5m contour mapping.",
  },
  {
    client: "ESCOM Malawi",
    scope: "Drone Training & Utility Mapping",
    detail: "48 engineers across a 3-week RPL program and 1-week advanced mapping course. LiDAR corridor modeling, thermal applications, RTK data integration.",
  },
  {
    client: "Waterboard — Southern Regions",
    scope: "Thermal Leak Detection Training",
    detail: "Specialized drone training for Blantyre and Southern Region Waterboards using thermal drones to detect water leakages in infrastructure.",
  },
  {
    client: "Paramount Holdings / Salima Sugar",
    scope: "Precision Aerial Spraying",
    detail: "Estate-scale precision spraying of urea fertilizer on sugarcane using the DJI Agras T50. Accurate application rates and uniform coverage.",
  },
];

const CLIENTS = [
  "Illovo Sugar", "UNICEF", "ESCOM", "SMEC", "LUANAR", "TACE",
  "VEI Netherlands", "Paramount Holdings", "Salima Sugar Factory",
  "Waterboard MW", "SH Aviation", "World Bank", "Swoop Aero",
  "MRA", "Malawi Govt", "ARISE", "GLOBHE", "Wellcome Programme",
];

const STATS = [
  { value: "120+", label: "Surveys" },
  { value: "50k+", label: "Hectares mapped" },
  { value: "80+", label: "Pilots trained" },
  { value: "20+", label: "Clients" },
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

export function Landing() {
  return (
    <div className="landing">
      {/* ── Header ── */}
      <header className="landing-header">
        <div className="landing-container landing-header-inner">
          <a href="#" className="landing-logo">
            <span className="landing-logo-mark">C</span>
            <span className="landing-logo-text">
              CAGE <span className="accent">Drones & Data</span>
            </span>
          </a>

          <nav className="landing-nav-desktop" aria-label="Primary">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="landing-nav-link">
                {item.label}
              </a>
            ))}
            <ThemeToggle />
            <Link href="/login" className="landing-nav-signin">
              Sign in
            </Link>
          </nav>

          <div className="landing-nav-mobile">
            <ThemeToggle />
            <Link href="/login" className="landing-nav-signin">
              Sign in
            </Link>
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

      {/* ── Hero ── */}
      <section className="landing-hero" aria-labelledby="hero-heading">
        <div className="landing-container">
          <p className="landing-eyebrow">Precision Drone Solutions — Malawi</p>
          <h1 id="hero-heading" className="landing-h1">
            Aerial intelligence<br />
            from sky to insight
          </h1>
          <p className="landing-hero-sub">
            High-precision mapping, crop intelligence, and professional drone services
            for agriculture, infrastructure, and environmental monitoring. In technical
            collaboration with{" "}
            <a
              href="https://www.luanar.ac.mw/tace/"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-inline-link"
            >
              TACE at LUANAR
            </a>.
          </p>
          <div className="landing-hero-actions">
            <a href="#contact" className="landing-btn-primary">
              Get a quote <ArrowRight size={16} aria-hidden />
            </a>
            <Link href="/register" className="landing-btn-secondary">
              Create account
            </Link>
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

      {/* ── Services ── */}
      <section id="services" className="landing-section">
        <div className="landing-container">
          <p className="landing-eyebrow">Services</p>
          <h2 className="landing-h2">What we do</h2>
          <div className="landing-services-grid">
            {SERVICES.map((s, i) => (
              <div key={s.title} className="landing-service">
                <span className="landing-service-num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="landing-service-title">{s.title}</h3>
                <p className="landing-service-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Experience ── */}
      <section id="experience" className="landing-section landing-section-alt">
        <div className="landing-container">
          <p className="landing-eyebrow">Track record</p>
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

      {/* ── Technology ── */}
      <section className="landing-section">
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

      {/* ── About / Why / Team ── */}
      <section id="about" className="landing-section landing-section-alt">
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
                <div>
                  <h4 className="landing-point-title">Speed</h4>
                  <p className="landing-point-desc">Fast turnaround with scalable, high-efficiency drone fleet deployments.</p>
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

              <p className="landing-eyebrow" style={{ marginTop: "2.5rem" }}>Mission</p>
              <p className="landing-body">
                To equip Malawi&apos;s public and private sectors with the tools, knowledge,
                and operational structure needed to deploy drone technology safely,
                profitably, and at scale.
              </p>

              <p className="landing-eyebrow" style={{ marginTop: "2.5rem" }}>Team</p>
              <ul className="landing-team-list">
                {TEAM.map((name) => (
                  <li key={name} className="landing-team-name">{name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Clients ── */}
      <section className="landing-section">
        <div className="landing-container">
          <p className="landing-eyebrow">Clients</p>
          <h2 className="landing-h2">Trusted by</h2>
          <div className="landing-clients-wrap">
            {CLIENTS.map((name) => (
              <span key={name} className="landing-client-name">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact CTA ── */}
      <section id="contact" className="landing-section landing-section-alt">
        <div className="landing-container landing-contact">
          <h2 className="landing-h2">Ready to take flight?</h2>
          <p className="landing-body" style={{ maxWidth: "36rem" }}>
            Whether you need aerial surveys, precision agriculture data, or drone
            training — share your sector and timeline and we&apos;ll connect you with
            the right team.
          </p>
          <div className="landing-hero-actions">
            <a
              href="https://www.cagemw.com"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-btn-primary"
            >
              Contact via website <ArrowRight size={16} aria-hidden />
            </a>
            <Link href="/login" className="landing-btn-secondary">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div className="landing-footer-left">
            <span className="landing-footer-brand">CAGE Drones & Data</span>
            <p className="landing-footer-desc">
              Malawi&apos;s leading drone and geospatial solutions provider. Operating
              in full compliance with the Malawi Civil Aviation Authority.
            </p>
          </div>
          <nav className="landing-footer-nav">
            {NAV.map((item) => (
              <a key={item.href} href={item.href}>{item.label}</a>
            ))}
            <Link href="/register">Register</Link>
            <Link href="/login">Sign in</Link>
            <a
              href="https://www.cagemw.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              cagemw.com
            </a>
          </nav>
          <p className="landing-footer-copy">
            © {new Date().getFullYear()} CAGE MW. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
