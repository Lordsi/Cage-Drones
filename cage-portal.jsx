import { useState, useEffect } from "react";
import {
  Map, Zap, Users, BookOpen, FileText, ChevronRight, Clock,
  CheckCircle, XCircle, Menu, X, BarChart2, Home, LogOut,
  Download, Play, AlertCircle, TrendingUp, Globe, Layers,
  Sprout, GraduationCap, ChevronLeft, Award, Eye, Lock,
  Wifi, Radar, Database
} from "lucide-react";

/* ──────────────────────────────────────────────
   STYLES
────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;800;900&family=Outfit:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --deep:#05081A; --surface:#0B1223; --card:#0F1830; --border:#1A2840;
    --cyan:#00C6FF; --cyan2:#33D1FF; --green:#22D3A3; --orange:#FF6535;
    --purple:#9B7EF5; --yellow:#FBBF24;
    --text:#E8F0FE; --muted:#5C7299; --muted2:#8A9EC5;
    --font-display:'Exo 2',sans-serif; --font-body:'Outfit',sans-serif;
  }
  body { background:var(--deep); color:var(--text); font-family:var(--font-body); }
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:var(--surface)}
  ::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}

  /* Backgrounds */
  .hero-bg {
    background:
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,198,255,0.14), transparent),
      radial-gradient(ellipse 50% 40% at 85% 85%, rgba(34,211,163,0.07), transparent),
      var(--deep);
  }
  .dot-grid {
    background-image: radial-gradient(rgba(0,198,255,0.18) 1px, transparent 1px);
    background-size:30px 30px;
  }
  .line-grid {
    background-image:
      linear-gradient(rgba(0,198,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg,rgba(0,198,255,0.04) 1px, transparent 1px);
    background-size:48px 48px;
  }

  /* Typography */
  .display { font-family:var(--font-display); }
  .hero-title { font-family:var(--font-display); font-size:clamp(2.4rem,6vw,5rem); font-weight:900; line-height:1.05; letter-spacing:-0.02em; }
  .section-title { font-family:var(--font-display); font-size:clamp(1.6rem,3vw,2.4rem); font-weight:800; }
  .tag { font-family:var(--font-display); font-size:.7rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; }

  /* Colors */
  .cyan { color:var(--cyan) } .muted { color:var(--muted) } .muted2 { color:var(--muted2) }

  /* Buttons */
  .btn-primary {
    background:var(--cyan); color:#000; font-weight:700; font-family:var(--font-display);
    border:none; cursor:pointer; display:inline-flex; align-items:center; gap:.5rem;
    transition:all .2s ease;
  }
  .btn-primary:hover { background:var(--cyan2); box-shadow:0 0 24px rgba(0,198,255,.45); transform:translateY(-1px); }
  .btn-outline {
    background:transparent; color:var(--cyan); font-weight:600; font-family:var(--font-display);
    border:1px solid rgba(0,198,255,.35); cursor:pointer; display:inline-flex; align-items:center; gap:.5rem;
    transition:all .2s ease;
  }
  .btn-outline:hover { background:rgba(0,198,255,.08); border-color:var(--cyan); }
  .btn-ghost {
    background:transparent; color:var(--muted2); font-weight:500;
    border:1px solid var(--border); cursor:pointer; display:inline-flex; align-items:center; gap:.5rem;
    transition:all .15s ease;
  }
  .btn-ghost:hover { background:rgba(255,255,255,.04); color:var(--text); }

  /* Cards */
  .card {
    background:var(--card); border:1px solid var(--border);
    transition:border-color .2s ease, transform .2s ease, box-shadow .2s ease;
  }
  .card:hover { border-color:rgba(0,198,255,.3); box-shadow:0 8px 32px rgba(0,198,255,.07); }
  .card-hover:hover { transform:translateY(-3px); }
  .card-glow { box-shadow:0 0 24px rgba(0,198,255,.12); border-color:rgba(0,198,255,.25) !important; }

  /* Progress */
  .prog-track { background:var(--border); border-radius:4px; overflow:hidden; }
  .prog-fill { height:100%; border-radius:4px; background:linear-gradient(90deg,var(--cyan),var(--cyan2)); transition:width .6s ease; }

  /* Nav */
  .nav-link { color:var(--muted2); font-weight:500; cursor:pointer; transition:color .15s ease; }
  .nav-link:hover { color:var(--text); }

  /* Sidebar */
  .sb-link {
    display:flex; align-items:center; gap:.75rem; padding:.6rem 1rem;
    border-radius:.5rem; cursor:pointer; color:var(--muted2); font-weight:500;
    border-left:3px solid transparent;
    transition:all .15s ease;
  }
  .sb-link:hover { background:rgba(0,198,255,.07); color:var(--text); }
  .sb-link.active { background:rgba(0,198,255,.1); color:var(--cyan); border-left-color:var(--cyan); }

  /* Badges */
  .badge { display:inline-flex; align-items:center; gap:.3rem; font-size:.7rem; font-weight:700; letter-spacing:.06em; padding:.2rem .6rem; border-radius:99px; font-family:var(--font-display); }
  .badge-green { background:rgba(34,211,163,.12); color:var(--green); border:1px solid rgba(34,211,163,.25); }
  .badge-cyan { background:rgba(0,198,255,.12); color:var(--cyan); border:1px solid rgba(0,198,255,.25); }
  .badge-orange { background:rgba(255,101,53,.12); color:var(--orange); border:1px solid rgba(255,101,53,.25); }
  .badge-gray { background:rgba(255,255,255,.06); color:var(--muted2); border:1px solid var(--border); }
  .badge-purple { background:rgba(155,126,245,.12); color:var(--purple); border:1px solid rgba(155,126,245,.25); }

  /* Animations */
  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scrollX { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes pulse-ring { 0%,100%{box-shadow:0 0 0 0 rgba(0,198,255,.3)} 50%{box-shadow:0 0 0 8px rgba(0,198,255,0)} }
  @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

  .fade-up { animation:fadeUp .55s ease both; }
  .fade-up-1 { animation:fadeUp .55s .1s ease both; }
  .fade-up-2 { animation:fadeUp .55s .2s ease both; }
  .fade-up-3 { animation:fadeUp .55s .35s ease both; }
  .fade-up-4 { animation:fadeUp .55s .5s ease both; }
  .scroll-x { animation:scrollX 28s linear infinite; }
  .pulse-ring { animation:pulse-ring 2.5s ease infinite; }

  /* Exam */
  .q-nav-btn { width:36px; height:36px; border-radius:8px; border:none; cursor:pointer; font-weight:700; font-size:.82rem; font-family:var(--font-display); transition:all .15s ease; }
  .q-nav-btn:hover { opacity:.85; transform:scale(1.05); }
  .q-unanswered { background:var(--card); color:var(--muted2); border:1px solid var(--border); }
  .q-answered { background:rgba(0,198,255,.15); color:var(--cyan); border:1px solid rgba(0,198,255,.3); }
  .q-current { background:var(--cyan); color:#000; box-shadow:0 0 12px rgba(0,198,255,.5); }
  .q-correct { background:rgba(34,211,163,.2); color:var(--green); border:1px solid rgba(34,211,163,.3); }
  .q-wrong { background:rgba(255,101,53,.2); color:var(--orange); border:1px solid rgba(255,101,53,.3); }

  .opt-btn {
    background:var(--card); border:1px solid var(--border); color:var(--text);
    text-align:left; cursor:pointer; border-radius:.75rem; padding:1rem 1.2rem;
    font-family:var(--font-body); font-size:.95rem; transition:all .15s ease; width:100%;
  }
  .opt-btn:hover { border-color:rgba(0,198,255,.4); background:rgba(0,198,255,.06); }
  .opt-selected { border-color:var(--cyan) !important; background:rgba(0,198,255,.12) !important; color:var(--cyan); }
  .opt-correct { border-color:var(--green) !important; background:rgba(34,211,163,.12) !important; color:var(--green); }
  .opt-wrong { border-color:var(--orange) !important; background:rgba(255,101,53,.12) !important; color:var(--orange); }
  
  /* Timer danger */
  .timer-danger { color:var(--orange) !important; animation:blink 1s ease infinite; }

  /* Divider */
  .divider { height:1px; background:linear-gradient(90deg, transparent, var(--border), transparent); }
`;

/* ──────────────────────────────────────────────
   MOCK DATA
────────────────────────────────────────────── */
const SERVICES = [
  { icon: Map,          title:"Aerial Mapping",           desc:"Orthomosaics, 3D models, DSM & DTM at engineering-grade accuracy.", color:"#00C6FF" },
  { icon: Sprout,       title:"Precision Agriculture",    desc:"NDVI/NDRE/NDWI crop health mapping and autonomous drone spraying.", color:"#22D3A3" },
  { icon: Award,        title:"Pilot Licensing (RPL)",    desc:"MCAA-compliant Remote Pilot Licenses in partnership with SH Aviation.", color:"#FF6535" },
  { icon: GraduationCap,title:"Advanced Training",        desc:"EVLOS/BVLOS, RTK/PPK workflows, Pix4D & DJI Terra field courses.", color:"#9B7EF5" },
  { icon: Zap,          title:"STEM Education",           desc:"Hands-on coding and drone fundamentals for young Malawian learners.", color:"#FBBF24" },
  { icon: Database,     title:"GeoPortal",                desc:"National geospatial data platform — centralized, secure & coming soon.", color:"#F472B6" },
];

const WHY = [
  { title:"Precision",    desc:"Engineering-grade accuracy aligned with global standards.", icon:Radar },
  { title:"Cost-Effective",desc:"Slash fieldwork and labor costs through data-driven ops.", icon:TrendingUp },
  { title:"Expertise",    desc:"Certified pilots, GIS analysts, engineers, and scientists.", icon:Users },
  { title:"Safety",       desc:"Remote capture in hazardous or hard-to-reach environments.", icon:Eye },
  { title:"Speed",        desc:"Fast turnaround with scalable high-efficiency drone fleets.", icon:Zap },
];

const CLIENTS = ["UNICEF","World Bank","ESCOM","Illovo Sugar","SH Aviation","Swoop Aero","TACE","MRA","Malawi Govt","LUANAR","ARISE","GLOBHE","Twilio","TG Enterprises","Wellcome Programme","PRIDE"];

const COURSES = [
  { id:1, title:"Remote Pilot Licensing (RPL)", progress:68, modules:8, color:"#00C6FF", icon:"✈" },
  { id:2, title:"Drone Mapping & GIS",          progress:42, modules:6, color:"#22D3A3", icon:"🗺" },
  { id:3, title:"Agricultural Drone Ops",        progress:15, modules:5, color:"#FF6535", icon:"🌱" },
  { id:4, title:"STEM Drone Fundamentals",       progress:90, modules:4, color:"#9B7EF5", icon:"⚡" },
];

const EXAMS = [
  { id:1, title:"Air Law & Regulations",   course:"Remote Pilot Licensing", duration:30, questions:10, status:"available", score:null },
  { id:2, title:"Meteorology for Pilots",  course:"Remote Pilot Licensing", duration:25, questions:10, status:"completed", score:85 },
  { id:3, title:"GIS Fundamentals Quiz",   course:"Drone Mapping & GIS",    duration:20, questions:10, status:"available", score:null },
  { id:4, title:"Crop Index Analysis",     course:"Agricultural Drone Ops", duration:15, questions:10, status:"locked",    score:null },
];

const Q_BANK = [
  { q:"What does RPL stand for in Malawian aviation?", opts:["Registered Pilot License","Remote Pilot License","Regulated Pilot Limit","Remote Pilot Limit"], ans:1 },
  { q:"Which body regulates drone operations in Malawi?", opts:["CAA Zimbabwe","Malawi Civil Aviation Authority (MCAA)","DCA Mozambique","IATA"], ans:1 },
  { q:"BVLOS stands for:", opts:["Beyond Visual Line of Sight","Basic Visual Landing Ops","Below Visual Lift-Off Speed","Beyond Vertical Launch Ops"], ans:0 },
  { q:"What does NDVI measure?", opts:["Soil moisture","General plant health / vegetation","Nitrogen levels only","Water irrigation patterns"], ans:1 },
  { q:"An orthomosaic map is best described as:", opts:["A 3D terrain model","A georeferenced aerial photo mosaic with uniform scale","A thermal heat map","A DSM showing building heights"], ans:1 },
  { q:"What does DTM exclude compared to a DSM?", opts:["Ground elevation data","Contour lines","Buildings, trees, and manmade structures","Georeferencing coordinates"], ans:2 },
  { q:"GCPs are used in drone mapping to:", opts:["Extend battery life","Improve positional accuracy of maps","Control wind effects","Regulate flight altitude"], ans:1 },
  { q:"Which index assesses water content in crops?", opts:["NDVI","NDRE","NDWI","VARI"], ans:2 },
  { q:"Pix4D and DJI Terra are primarily used for:", opts:["Fleet management","Photo editing","Data processing and map generation","Firmware updates"], ans:2 },
  { q:"NDRE is used to assess:", opts:["Basic vegetation","Water content","Chlorophyll / nitrogen levels","Terrain elevation"], ans:2 },
];

const ASSIGNMENTS = [
  { id:1, title:"Mission Planning — Lilongwe Survey",  course:"Drone Mapping & GIS",    due:"10 May 2026", status:"pending",   grade:null, type:"Practical" },
  { id:2, title:"NDVI Report — Tea Estate Survey",     course:"Agricultural Drone Ops", due:"15 May 2026", status:"submitted", grade:null, type:"Report" },
  { id:3, title:"Air Law Case Study",                  course:"Remote Pilot Licensing", due:"08 May 2026", status:"graded",    grade:"A",  type:"Written" },
  { id:4, title:"GCP Placement Worksheet",             course:"Drone Mapping & GIS",    due:"20 May 2026", status:"pending",   grade:null, type:"Worksheet" },
  { id:5, title:"Spray Pattern Analysis",              course:"Agricultural Drone Ops", due:"22 May 2026", status:"graded",    grade:"B+", type:"Report" },
];

const RESOURCES = [
  { id:1, title:"MCAA Drone Regulations 2024",      course:"Remote Pilot Licensing", type:"PDF",   meta:"2.3 MB" },
  { id:2, title:"Introduction to Photogrammetry",   course:"Drone Mapping & GIS",    type:"Video", meta:"45 min" },
  { id:3, title:"Crop Health Index Field Guide",    course:"Agricultural Drone Ops", type:"PDF",   meta:"1.8 MB" },
  { id:4, title:"DJI Mavic 3E Flight Manual",       course:"Remote Pilot Licensing", type:"PDF",   meta:"5.1 MB" },
  { id:5, title:"Mission Planner Tutorial",         course:"Drone Mapping & GIS",    type:"Video", meta:"32 min" },
  { id:6, title:"NDVI Analysis with Pix4D",         course:"Agricultural Drone Ops", type:"Video", meta:"28 min" },
  { id:7, title:"STEM Coding Starter Pack",         course:"STEM Fundamentals",      type:"PDF",   meta:"3.4 MB" },
  { id:8, title:"RTK vs PPK Explained",             course:"Drone Mapping & GIS",    type:"Video", meta:"18 min" },
];

/* ──────────────────────────────────────────────
   LANDING PAGE
────────────────────────────────────────────── */
function LandingPage({ onLogin }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ background:"var(--deep)", minHeight:"100vh", overflowX:"hidden" }}>
      {/* Navbar */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(5,8,26,.85)", backdropFilter:"blur(12px)", borderBottom:"1px solid var(--border)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 1.5rem", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:.75+"rem" }}>
            <div style={{ width:36, height:36, borderRadius:8, background:"var(--cyan)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Radar size={20} color="#000" />
            </div>
            <span className="display" style={{ fontWeight:800, fontSize:"1.2rem", letterSpacing:"-.01em" }}>CAGE<span className="cyan"> Drones</span></span>
          </div>
          <div style={{ display:"flex", gap:"2rem", alignItems:"center" }}>
            {["Services","Training","About","Clients"].map(l => (
              <span key={l} className="nav-link" style={{ fontSize:".9rem" }}>{l}</span>
            ))}
            <button className="btn-primary" style={{ padding:".45rem 1.2rem", borderRadius:.5+"rem", fontSize:".85rem" }} onClick={onLogin}>
              Student Portal →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-bg dot-grid" style={{ minHeight:"92vh", display:"flex", flexDirection:"column", justifyContent:"center", padding:"4rem 1.5rem", position:"relative", overflow:"hidden" }}>
        {/* Decorative rings */}
        <div style={{ position:"absolute", top:"50%", right:"-10%", transform:"translateY(-50%)", width:600, height:600, borderRadius:"50%", border:"1px solid rgba(0,198,255,.07)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"50%", right:"-5%", transform:"translateY(-50%)", width:420, height:420, borderRadius:"50%", border:"1px solid rgba(0,198,255,.1)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"50%", right:"0%", transform:"translateY(-50%)", width:260, height:260, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,198,255,.06), transparent)", pointerEvents:"none" }} />

        <div style={{ maxWidth:1200, margin:"0 auto", width:"100%" }}>
          <div className="fade-up" style={{ marginBottom:"1rem" }}>
            <span className="badge badge-cyan tag">Malawi's Leading Drone & Geospatial Provider</span>
          </div>
          <h1 className="hero-title fade-up-1" style={{ maxWidth:700, marginBottom:"1.5rem" }}>
            FLY SMARTER.<br/>
            <span className="cyan">MAP BETTER.</span><br/>
            GROW FASTER.
          </h1>
          <p className="fade-up-2" style={{ fontSize:"1.1rem", color:"var(--muted2)", maxWidth:540, lineHeight:1.7, marginBottom:"2.5rem" }}>
            End-to-end aerial surveys, precision agriculture, pilot licensing, and geospatial intelligence — built for Malawi, scaled for southern Africa.
          </p>
          <div className="fade-up-3" style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}>
            <button className="btn-primary" style={{ padding:".8rem 2rem", borderRadius:.75+"rem", fontSize:"1rem" }}>
              Get a Quote <ChevronRight size={18} />
            </button>
            <button className="btn-outline" style={{ padding:".8rem 2rem", borderRadius:.75+"rem", fontSize:"1rem" }} onClick={onLogin}>
              Student Portal
            </button>
          </div>

          {/* Stats */}
          <div className="fade-up-4" style={{ display:"flex", gap:"3rem", marginTop:"4rem", flexWrap:"wrap" }}>
            {[["120+","Surveys Completed"],["50,000+","Hectares Mapped"],["80+","Pilots Trained"],["20+","Enterprise Clients"]].map(([n,l]) => (
              <div key={l}>
                <div className="display" style={{ fontSize:"2rem", fontWeight:900, color:"var(--cyan)" }}>{n}</div>
                <div style={{ fontSize:".82rem", color:"var(--muted)", marginTop:".15rem" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="line-grid" style={{ padding:"6rem 1.5rem" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ marginBottom:"3rem" }}>
            <span className="tag muted" style={{ display:"block", marginBottom:".75rem" }}>What We Do</span>
            <h2 className="section-title">Our Services</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:"1.25rem" }}>
            {SERVICES.map((s, i) => (
              <div key={s.title} className="card card-hover card-glow" style={{ borderRadius:"1rem", padding:"1.75rem", animationDelay:`${i*.08}s` }}>
                <div style={{ width:48, height:48, borderRadius:.75+"rem", background:`${s.color}18`, border:`1px solid ${s.color}30`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"1.25rem" }}>
                  <s.icon size={22} color={s.color} />
                </div>
                <h3 className="display" style={{ fontSize:"1.05rem", fontWeight:700, marginBottom:".5rem" }}>{s.title}</h3>
                <p style={{ fontSize:".88rem", color:"var(--muted2)", lineHeight:1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why CAGE */}
      <section style={{ padding:"6rem 1.5rem", background:"var(--surface)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"3.5rem" }}>
            <span className="tag muted" style={{ display:"block", marginBottom:".75rem" }}>Why Choose Us</span>
            <h2 className="section-title">Built Different</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:"1.5rem" }}>
            {WHY.map((w) => (
              <div key={w.title} className="card" style={{ borderRadius:"1rem", padding:"1.75rem", textAlign:"center" }}>
                <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(0,198,255,.1)", border:"1px solid rgba(0,198,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem" }}>
                  <w.icon size={22} color="var(--cyan)" />
                </div>
                <div className="display" style={{ fontWeight:800, fontSize:"1rem", marginBottom:".4rem" }}>{w.title}</div>
                <div style={{ fontSize:".83rem", color:"var(--muted2)", lineHeight:1.55 }}>{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients Marquee */}
      <section style={{ padding:"4rem 0", overflow:"hidden", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)" }}>
        <div style={{ marginBottom:"1.5rem", textAlign:"center" }}>
          <span className="tag muted">Trusted By</span>
        </div>
        <div style={{ display:"flex", overflow:"hidden" }}>
          <div className="scroll-x" style={{ display:"flex", gap:"3rem", whiteSpace:"nowrap", paddingLeft:"2rem" }}>
            {[...CLIENTS, ...CLIENTS].map((c, i) => (
              <span key={i} className="display" style={{ fontSize:".9rem", fontWeight:700, color:"var(--muted)", letterSpacing:".08em", textTransform:"uppercase" }}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-bg" style={{ padding:"6rem 1.5rem", textAlign:"center" }}>
        <div style={{ maxWidth:600, margin:"0 auto" }}>
          <h2 className="section-title" style={{ marginBottom:"1rem" }}>Ready to Take Flight?</h2>
          <p style={{ color:"var(--muted2)", fontSize:"1.05rem", lineHeight:1.7, marginBottom:"2rem" }}>
            Whether you need aerial surveys, precision ag data, or drone training — CAGE delivers from sky to screen.
          </p>
          <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
            <button className="btn-primary" style={{ padding:".85rem 2.2rem", borderRadius:.75+"rem", fontSize:"1rem" }}>Contact Us</button>
            <button className="btn-outline" style={{ padding:".85rem 2.2rem", borderRadius:.75+"rem", fontSize:"1rem" }} onClick={onLogin}>Access Portal</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:"var(--surface)", padding:"2rem 1.5rem", borderTop:"1px solid var(--border)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:".6rem" }}>
            <div style={{ width:28, height:28, borderRadius:6, background:"var(--cyan)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Radar size={14} color="#000" />
            </div>
            <span className="display" style={{ fontWeight:800, fontSize:".95rem" }}>CAGE Drones & Data</span>
          </div>
          <span style={{ color:"var(--muted)", fontSize:".82rem" }}>© 2026 CAGE MW. All rights reserved. · www.cagemw.com</span>
        </div>
      </footer>
    </div>
  );
}

/* ──────────────────────────────────────────────
   STUDENT PORTAL
────────────────────────────────────────────── */
function StudentPortal({ tab, setTab, onLogout, onStartExam }) {
  const NAV = [
    { id:"dashboard",   label:"Dashboard",   icon:Home },
    { id:"exams",       label:"Exams",       icon:FileText },
    { id:"assignments", label:"Assignments", icon:BookOpen },
    { id:"resources",   label:"Resources",   icon:Layers },
  ];

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--deep)" }}>
      {/* Sidebar */}
      <aside style={{ width:240, background:"var(--surface)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", padding:"1.25rem", position:"sticky", top:0, height:"100vh" }}>
        <div style={{ display:"flex", alignItems:"center", gap:".6rem", padding:".5rem .25rem", marginBottom:"2rem" }}>
          <div style={{ width:34, height:34, borderRadius:8, background:"var(--cyan)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Radar size={18} color="#000" />
          </div>
          <div>
            <div className="display" style={{ fontWeight:800, fontSize:".9rem", lineHeight:1.2 }}>CAGE Portal</div>
            <div style={{ fontSize:".68rem", color:"var(--muted)", letterSpacing:".06em" }}>LEARNING HUB</div>
          </div>
        </div>

        <div style={{ marginBottom:".5rem" }}>
          <div className="tag muted" style={{ fontSize:".65rem", marginBottom:".5rem", paddingLeft:".25rem" }}>Navigation</div>
          {NAV.map(n => (
            <div key={n.id} className={`sb-link ${tab===n.id?"active":""}`} onClick={() => setTab(n.id)}>
              <n.icon size={17} />
              <span style={{ fontSize:".88rem" }}>{n.label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop:"auto" }}>
          <div className="divider" style={{ margin:".75rem 0" }} />
          <div style={{ display:"flex", alignItems:"center", gap:".75rem", padding:".5rem .25rem", marginBottom:".5rem" }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#00C6FF,#9B7EF5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".85rem", fontWeight:700, color:"#000" }}>T</div>
            <div>
              <div style={{ fontSize:".85rem", fontWeight:600 }}>Trainee User</div>
              <div style={{ fontSize:".7rem", color:"var(--muted)" }}>RPL Course</div>
            </div>
          </div>
          <div className="sb-link" onClick={onLogout} style={{ color:"var(--orange)" }}>
            <LogOut size={16} />
            <span style={{ fontSize:".85rem" }}>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, padding:"2rem", overflowY:"auto" }}>
        {tab==="dashboard"   && <Dashboard setTab={setTab} />}
        {tab==="exams"       && <Exams onStartExam={onStartExam} />}
        {tab==="assignments" && <Assignments />}
        {tab==="resources"   && <Resources />}
      </main>
    </div>
  );
}

/* Dashboard */
function Dashboard({ setTab }) {
  return (
    <div>
      <div className="fade-up" style={{ marginBottom:"2rem" }}>
        <div className="tag muted" style={{ marginBottom:".3rem" }}>Welcome back</div>
        <h1 className="display" style={{ fontSize:"1.75rem", fontWeight:800 }}>Good morning, <span className="cyan">Trainee</span> 👋</h1>
      </div>

      {/* Quick stats */}
      <div className="fade-up-1" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:"1rem", marginBottom:"2rem" }}>
        {[
          { label:"Courses Active",  val:"4",  icon:BookOpen,   color:"#00C6FF" },
          { label:"Exams Available", val:"2",  icon:FileText,   color:"#22D3A3" },
          { label:"Assignments Due", val:"2",  icon:AlertCircle,color:"#FF6535" },
          { label:"Avg Score",       val:"85%",icon:TrendingUp, color:"#9B7EF5" },
        ].map(s => (
          <div key={s.label} className="card" style={{ borderRadius:"1rem", padding:"1.25rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".75rem" }}>
              <span style={{ fontSize:".8rem", color:"var(--muted2)" }}>{s.label}</span>
              <s.icon size={16} color={s.color} />
            </div>
            <div className="display" style={{ fontSize:"2rem", fontWeight:900, color:s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Courses progress */}
      <div className="fade-up-2" style={{ marginBottom:"2rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
          <h2 className="display" style={{ fontSize:"1.1rem", fontWeight:700 }}>My Courses</h2>
          <span style={{ fontSize:".82rem", color:"var(--cyan)", cursor:"pointer" }}>View all →</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1rem" }}>
          {COURSES.map(c => (
            <div key={c.id} className="card" style={{ borderRadius:"1rem", padding:"1.25rem" }}>
              <div style={{ display:"flex", gap:".75rem", alignItems:"flex-start", marginBottom:"1rem" }}>
                <div style={{ fontSize:"1.5rem", width:44, height:44, borderRadius:.75+"rem", background:`${c.color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>{c.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:".88rem", fontWeight:600, marginBottom:".2rem" }}>{c.title}</div>
                  <div style={{ fontSize:".75rem", color:"var(--muted)" }}>{c.modules} modules</div>
                </div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".4rem" }}>
                <span style={{ fontSize:".75rem", color:"var(--muted2)" }}>Progress</span>
                <span className="display" style={{ fontSize:".75rem", fontWeight:700, color:c.color }}>{c.progress}%</span>
              </div>
              <div className="prog-track" style={{ height:6 }}>
                <div className="prog-fill" style={{ width:`${c.progress}%`, background:`linear-gradient(90deg,${c.color},${c.color}BB)` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming / quick actions */}
      <div className="fade-up-3" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem" }}>
        <div className="card" style={{ borderRadius:"1rem", padding:"1.25rem" }}>
          <h3 className="display" style={{ fontSize:"1rem", fontWeight:700, marginBottom:"1rem" }}>Upcoming Deadlines</h3>
          {ASSIGNMENTS.filter(a=>a.status==="pending").map(a => (
            <div key={a.id} style={{ display:"flex", gap:".75rem", alignItems:"center", padding:".6rem 0", borderBottom:"1px solid var(--border)" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--orange)", flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:".83rem", fontWeight:500 }}>{a.title}</div>
                <div style={{ fontSize:".72rem", color:"var(--muted)" }}>Due {a.due}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="card" style={{ borderRadius:"1rem", padding:"1.25rem" }}>
          <h3 className="display" style={{ fontSize:"1rem", fontWeight:700, marginBottom:"1rem" }}>Quick Actions</h3>
          {[["Take an Exam","exams","var(--cyan)"],["View Assignments","assignments","var(--green)"],["Browse Resources","resources","var(--purple)"]].map(([l,t,c]) => (
            <button key={l} className="btn-ghost" style={{ width:"100%", borderRadius:.5+"rem", padding:".7rem 1rem", marginBottom:".5rem", justifyContent:"space-between", fontSize:".85rem" }} onClick={()=>{}}>
              <span>{l}</span><ChevronRight size={15} color={c} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Exams */
function Exams({ onStartExam }) {
  const statusBadge = (status, score) => {
    if (status==="completed") return <span className="badge badge-green"><CheckCircle size={10}/>Completed · {score}%</span>;
    if (status==="locked")    return <span className="badge badge-gray"><Lock size={10}/>Locked</span>;
    return <span className="badge badge-cyan">Available</span>;
  };

  return (
    <div>
      <div className="fade-up" style={{ marginBottom:"2rem" }}>
        <div className="tag muted" style={{ marginBottom:".3rem" }}>Assessment Centre</div>
        <h1 className="display" style={{ fontSize:"1.75rem", fontWeight:800 }}>My Exams</h1>
      </div>

      <div style={{ display:"grid", gap:"1rem" }}>
        {EXAMS.map((e, i) => (
          <div key={e.id} className="card" style={{ borderRadius:"1rem", padding:"1.5rem", display:"flex", alignItems:"center", gap:"1.25rem", animationDelay:`${i*.07}s` }}>
            <div style={{ width:52, height:52, borderRadius:"1rem", background:"rgba(0,198,255,.08)", border:"1px solid rgba(0,198,255,.15)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <FileText size={22} color="var(--cyan)" />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:".75rem", alignItems:"center", marginBottom:".3rem", flexWrap:"wrap" }}>
                <span className="display" style={{ fontWeight:700, fontSize:"1.02rem" }}>{e.title}</span>
                {statusBadge(e.status, e.score)}
              </div>
              <div style={{ fontSize:".82rem", color:"var(--muted2)" }}>{e.course} · {e.questions} questions · {e.duration} min</div>
            </div>
            {e.status==="available" && (
              <button className="btn-primary" style={{ padding:".6rem 1.4rem", borderRadius:.6+"rem", fontSize:".85rem", flexShrink:0 }} onClick={() => onStartExam(e)}>
                Start Exam
              </button>
            )}
            {e.status==="completed" && (
              <button className="btn-ghost" style={{ padding:".6rem 1.2rem", borderRadius:.6+"rem", fontSize:".82rem", flexShrink:0 }}>
                Review
              </button>
            )}
            {e.status==="locked" && (
              <div style={{ color:"var(--muted)", display:"flex", alignItems:"center", gap:".4rem", fontSize:".82rem" }}>
                <Lock size={14}/> Complete prior module
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Assignments */
function Assignments() {
  const statusBadge = (s) => {
    if (s==="graded")    return <span className="badge badge-green">Graded</span>;
    if (s==="submitted") return <span className="badge badge-cyan">Submitted</span>;
    return <span className="badge badge-orange">Pending</span>;
  };

  return (
    <div>
      <div className="fade-up" style={{ marginBottom:"2rem" }}>
        <div className="tag muted" style={{ marginBottom:".3rem" }}>Coursework</div>
        <h1 className="display" style={{ fontSize:"1.75rem", fontWeight:800 }}>Assignments</h1>
      </div>
      <div style={{ display:"grid", gap:".85rem" }}>
        {ASSIGNMENTS.map((a, i) => (
          <div key={a.id} className="card" style={{ borderRadius:"1rem", padding:"1.25rem 1.5rem", display:"flex", alignItems:"center", gap:"1rem", animationDelay:`${i*.06}s` }}>
            <div style={{ width:44, height:44, borderRadius:.75+"rem", background:"rgba(155,126,245,.1)", border:"1px solid rgba(155,126,245,.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <BookOpen size={18} color="var(--purple)" />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:".6rem", alignItems:"center", marginBottom:".25rem", flexWrap:"wrap" }}>
                <span style={{ fontWeight:600, fontSize:".95rem" }}>{a.title}</span>
                {statusBadge(a.status)}
                <span className="badge badge-gray">{a.type}</span>
              </div>
              <div style={{ fontSize:".78rem", color:"var(--muted2)" }}>{a.course} · Due {a.due}</div>
            </div>
            {a.grade && (
              <div className="display" style={{ fontSize:"1.4rem", fontWeight:900, color:"var(--green)", flexShrink:0 }}>{a.grade}</div>
            )}
            {a.status==="pending" && (
              <button className="btn-primary" style={{ padding:".5rem 1.2rem", borderRadius:.5+"rem", fontSize:".8rem", flexShrink:0 }}>Submit</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Resources */
function Resources() {
  return (
    <div>
      <div className="fade-up" style={{ marginBottom:"2rem" }}>
        <div className="tag muted" style={{ marginBottom:".3rem" }}>Learning Materials</div>
        <h1 className="display" style={{ fontSize:"1.75rem", fontWeight:800 }}>Resources</h1>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1rem" }}>
        {RESOURCES.map((r, i) => (
          <div key={r.id} className="card card-hover" style={{ borderRadius:"1rem", padding:"1.25rem", cursor:"pointer", animationDelay:`${i*.05}s` }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:".85rem" }}>
              <div style={{ width:42, height:42, borderRadius:.75+"rem", background: r.type==="PDF"?"rgba(255,101,53,.1)":"rgba(34,211,163,.1)", border:`1px solid ${r.type==="PDF"?"rgba(255,101,53,.2)":"rgba(34,211,163,.2)"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {r.type==="PDF" ? <Download size={18} color="var(--orange)" /> : <Play size={18} color="var(--green)" />}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:".88rem", marginBottom:".25rem", lineHeight:1.4 }}>{r.title}</div>
                <div style={{ fontSize:".75rem", color:"var(--muted2)", marginBottom:".6rem" }}>{r.course}</div>
                <div style={{ display:"flex", gap:".5rem", alignItems:"center" }}>
                  <span className={`badge ${r.type==="PDF"?"badge-orange":"badge-green"}`}>{r.type}</span>
                  <span style={{ fontSize:".72rem", color:"var(--muted)" }}>{r.meta}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   EXAM INTERFACE (testportal-style)
────────────────────────────────────────────── */
function ExamInterface({ exam, questions, answers, setAnswers, currentQ, setCurrentQ, timeLeft, formatTime, submitted, score, onSubmit, onBack }) {
  const q = questions[currentQ];
  const answered = Object.keys(answers).length;
  const total = questions.length;
  const timerDanger = timeLeft < 120;

  const selectAnswer = (idx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [currentQ]: idx }));
  };

  const getOptClass = (i) => {
    if (!submitted) return answers[currentQ]===i ? "opt-btn opt-selected" : "opt-btn";
    if (i===q.ans) return "opt-btn opt-correct";
    if (answers[currentQ]===i && answers[currentQ]!==q.ans) return "opt-btn opt-wrong";
    return "opt-btn";
  };

  const getQClass = (i) => {
    if (submitted) {
      if (answers[i]===questions[i].ans) return "q-nav-btn q-correct";
      return "q-nav-btn q-wrong";
    }
    if (i===currentQ) return "q-nav-btn q-current";
    if (answers[i]!==undefined) return "q-nav-btn q-answered";
    return "q-nav-btn q-unanswered";
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--deep)", display:"flex", flexDirection:"column" }}>
      {/* Exam Header */}
      <header style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"0 2rem", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
          <button className="btn-ghost" style={{ padding:".35rem .8rem", borderRadius:.4+"rem", fontSize:".8rem" }} onClick={onBack}>
            <ChevronLeft size={15} /> Exit
          </button>
          <div className="divider" style={{ width:1, height:28, margin:"0 .25rem" }} />
          <span className="display" style={{ fontWeight:700, fontSize:".95rem" }}>{exam.title}</span>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:"1.5rem" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:".68rem", color:"var(--muted)", letterSpacing:".08em", textTransform:"uppercase" }}>Progress</div>
            <div className="display" style={{ fontSize:".88rem", fontWeight:700 }}>{answered}/{total}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:".68rem", color:"var(--muted)", letterSpacing:".08em", textTransform:"uppercase" }}>Time Left</div>
            <div className={`display ${timerDanger?"timer-danger":""}`} style={{ fontSize:"1.1rem", fontWeight:900, color:timerDanger?"var(--orange)":"var(--cyan)" }}>
              <Clock size={12} style={{ display:"inline", marginRight:4 }} />{formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="prog-track" style={{ height:3, borderRadius:0, background:"var(--border)" }}>
        <div className="prog-fill" style={{ width:`${(answered/total)*100}%`, transition:"width .3s ease" }} />
      </div>

      {submitted ? (
        /* Results Screen */
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
          <div className="card" style={{ borderRadius:"1.5rem", padding:"3rem", textAlign:"center", maxWidth:480, width:"100%" }}>
            <div style={{ width:80, height:80, borderRadius:"50%", background: score>=75?"rgba(34,211,163,.15)":"rgba(255,101,53,.15)", border:`2px solid ${score>=75?"var(--green)":"var(--orange)"}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.5rem", fontSize:"2.5rem" }}>
              {score>=75?"🎯":"📚"}
            </div>
            <div className="display" style={{ fontSize:"3.5rem", fontWeight:900, color:score>=75?"var(--green)":"var(--orange)", lineHeight:1 }}>{score}%</div>
            <div style={{ marginTop:".5rem", marginBottom:"1.5rem", color:"var(--muted2)", fontSize:".9rem" }}>
              {score>=75 ? "Excellent work! You passed this module." : "Keep studying — you can retake this exam."}
            </div>
            <div style={{ display:"flex", gap:".75rem", justifyContent:"space-between", marginBottom:"2rem", padding:"1rem", background:"var(--surface)", borderRadius:".75rem" }}>
              {[["Correct", `${Math.round(score/10)}/${total}`,"var(--green)"],["Incorrect",`${total-Math.round(score/10)}/${total}`,"var(--orange)"],["Score",`${score}%`,score>=75?"var(--green)":"var(--orange)"]].map(([l,v,c])=>(
                <div key={l} style={{ textAlign:"center" }}>
                  <div className="display" style={{ fontSize:"1.2rem", fontWeight:800, color:c }}>{v}</div>
                  <div style={{ fontSize:".72rem", color:"var(--muted)" }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:"1.5rem", textAlign:"left" }}>
              <div className="display" style={{ fontWeight:700, fontSize:".9rem", marginBottom:".75rem" }}>Review Answers</div>
              {questions.map((qq,i) => (
                <div key={i} style={{ display:"flex", gap:".6rem", alignItems:"center", padding:".5rem 0", borderBottom:"1px solid var(--border)", fontSize:".8rem" }}>
                  {answers[i]===qq.ans ? <CheckCircle size={14} color="var(--green)" /> : <XCircle size={14} color="var(--orange)" />}
                  <span style={{ color:"var(--muted2)", flex:1 }}>Q{i+1}: {qq.q.slice(0,40)}...</span>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ padding:".75rem 2rem", borderRadius:.75+"rem", width:"100%", fontSize:".9rem" }} onClick={onBack}>
              Back to Exams
            </button>
          </div>
        </div>
      ) : (
        /* Exam Body */
        <div style={{ flex:1, display:"flex", gap:0 }}>
          {/* Question Area */}
          <div style={{ flex:1, padding:"2.5rem", overflowY:"auto" }}>
            <div style={{ maxWidth:700, margin:"0 auto" }}>
              <div style={{ marginBottom:"2rem" }}>
                <span className="tag" style={{ color:"var(--muted)", fontSize:".68rem" }}>Question {currentQ+1} of {total}</span>
                <h2 className="display" style={{ fontSize:"1.25rem", fontWeight:700, marginTop:".75rem", lineHeight:1.5 }}>{q.q}</h2>
              </div>
              <div style={{ display:"grid", gap:".75rem" }}>
                {q.opts.map((opt, i) => (
                  <button key={i} className={getOptClass(i)} onClick={() => selectAnswer(i)} style={{ display:"flex", gap:"1rem", alignItems:"center" }}>
                    <span className="display" style={{ width:28, height:28, borderRadius:6, background:"rgba(255,255,255,.06)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".78rem", fontWeight:700, flexShrink:0 }}>
                      {["A","B","C","D"][i]}
                    </span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
              {/* Nav buttons */}
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:"2.5rem" }}>
                <button className="btn-ghost" style={{ padding:".6rem 1.4rem", borderRadius:.6+"rem", fontSize:".88rem" }} onClick={() => setCurrentQ(Math.max(0,currentQ-1))} disabled={currentQ===0}>
                  <ChevronLeft size={16} /> Previous
                </button>
                {currentQ < total-1 ? (
                  <button className="btn-outline" style={{ padding:".6rem 1.4rem", borderRadius:.6+"rem", fontSize:".88rem" }} onClick={() => setCurrentQ(Math.min(total-1,currentQ+1))}>
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button className="btn-primary" style={{ padding:".6rem 1.6rem", borderRadius:.6+"rem", fontSize:".88rem" }} onClick={onSubmit}>
                    Submit Exam <Award size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <aside style={{ width:280, background:"var(--surface)", borderLeft:"1px solid var(--border)", padding:"1.75rem", overflowY:"auto" }}>
            <div className="display" style={{ fontSize:".78rem", fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"var(--muted)", marginBottom:"1rem" }}>Questions</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:".4rem", marginBottom:"1.75rem" }}>
              {questions.map((_, i) => (
                <button key={i} className={getQClass(i)} onClick={() => setCurrentQ(i)}>{i+1}</button>
              ))}
            </div>
            <div className="divider" style={{ marginBottom:"1.5rem" }} />
            <div style={{ fontSize:".78rem", color:"var(--muted2)", marginBottom:"1.25rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".5rem" }}>
                <span>Answered</span><span className="display" style={{ fontWeight:700, color:"var(--cyan)" }}>{answered}/{total}</span>
              </div>
              <div className="prog-track" style={{ height:5, marginBottom:"1rem" }}>
                <div className="prog-fill" style={{ width:`${(answered/total)*100}%` }} />
              </div>
              <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap" }}>
                <span style={{ display:"flex", alignItems:"center", gap:.25+"rem" }}><span style={{ width:10, height:10, borderRadius:2, background:"rgba(0,198,255,.3)", display:"inline-block" }} />Answered</span>
                <span style={{ display:"flex", alignItems:"center", gap:.25+"rem" }}><span style={{ width:10, height:10, borderRadius:2, background:"var(--card)", border:"1px solid var(--border)", display:"inline-block" }} />Skipped</span>
              </div>
            </div>
            {answered===total && (
              <button className="btn-primary" style={{ width:"100%", padding:".75rem", borderRadius:.6+"rem", fontSize:".88rem", justifyContent:"center" }} onClick={onSubmit}>
                Submit Exam <Award size={16} />
              </button>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   ROOT APP
────────────────────────────────────────────── */
export default function CAGEApp() {
  const [view, setView]             = useState("landing");
  const [portalTab, setPortalTab]   = useState("dashboard");
  const [activeExam, setActiveExam] = useState(null);
  const [answers, setAnswers]       = useState({});
  const [currentQ, setCurrentQ]     = useState(0);
  const [timeLeft, setTimeLeft]     = useState(0);
  const [submitted, setSubmitted]   = useState(false);
  const [score, setScore]           = useState(null);

  useEffect(() => {
    if (!activeExam || submitted) return;
    const t = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(t); handleSubmit(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [activeExam, submitted]);

  const handleStartExam = (exam) => {
    setActiveExam(exam);
    setAnswers({});
    setCurrentQ(0);
    setTimeLeft(exam.duration * 60);
    setSubmitted(false);
    setScore(null);
  };

  const handleSubmit = () => {
    let c = 0;
    Q_BANK.forEach((q, i) => { if (answers[i]===q.ans) c++; });
    setScore(Math.round((c / Q_BANK.length) * 100));
    setSubmitted(true);
  };

  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  return (
    <>
      <style>{STYLES}</style>
      {activeExam ? (
        <ExamInterface
          exam={activeExam}
          questions={Q_BANK}
          answers={answers}
          setAnswers={setAnswers}
          currentQ={currentQ}
          setCurrentQ={setCurrentQ}
          timeLeft={timeLeft}
          formatTime={fmt}
          submitted={submitted}
          score={score}
          onSubmit={handleSubmit}
          onBack={() => { setActiveExam(null); setPortalTab("exams"); }}
        />
      ) : view === "landing" ? (
        <LandingPage onLogin={() => setView("portal")} />
      ) : (
        <StudentPortal
          tab={portalTab}
          setTab={setPortalTab}
          onLogout={() => setView("landing")}
          onStartExam={handleStartExam}
        />
      )}
    </>
  );
}
