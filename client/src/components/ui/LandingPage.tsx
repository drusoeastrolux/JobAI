import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FileText, TrendingUp, Sparkles, LayoutGrid } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onLaunchChat: () => void;
}

/* ── Reveal ───────────────────────────────────────────────────────────────── */
function RevealUp({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      delay,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
    });
    return () => { t.scrollTrigger?.kill(); t.kill(); };
  }, [delay]);
  return <div ref={ref} className={`reveal-up ${className ?? ""}`}>{children}</div>;
}

/* ── Animated counter ─────────────────────────────────────────────────────── */
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      onEnter() {
        if (started.current) return;
        started.current = true;
        const dur = 1800;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / dur, 1);
          setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
    });
    return () => st.kill();
  }, [value]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

/* ── Circle gauge ─────────────────────────────────────────────────────────── */
function CircleGauge() {
  const circleRef = useRef<SVGCircleElement>(null);
  const started = useRef(false);
  const circumference = 628;

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      onEnter() {
        if (started.current) return;
        started.current = true;
        gsap.to(el, {
          strokeDashoffset: circumference - circumference * 0.98,
          duration: 2,
          ease: "power2.out",
        });
      },
    });
    return () => st.kill();
  }, []);

  return (
    <div className="w-full aspect-square bg-white rounded-full soft-shadow flex items-center justify-center relative overflow-hidden group">
      <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full" />
      <svg className="absolute inset-0 w-full h-full -rotate-90 p-4" viewBox="0 0 210 210">
        <circle cx="105" cy="105" r="100" fill="none" stroke="#e8e8e8" strokeWidth="2" />
        <circle
          ref={circleRef}
          cx="105" cy="105" r="100"
          fill="none"
          stroke="#ba002c"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <div className="text-center z-10 px-4">
        <div className="font-label text-[10px] text-secondary tracking-widest mb-3 uppercase">ATS Resonance</div>
        <div className="font-headline italic text-on-surface" style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)", lineHeight: 1 }}>
          98<span className="text-secondary" style={{ fontSize: "0.4em" }}>%</span>
        </div>
        <div className="mt-5 flex justify-center items-end gap-1.5">
          {[
            { h: "h-8", fill: "h-3/4" },
            { h: "h-12", fill: "h-full" },
            { h: "h-10", fill: "h-5/6" },
          ].map((bar, i) => (
            <div key={i} className={`w-1 ${bar.h} bg-secondary/10 rounded-full overflow-hidden relative`}>
              <div className={`absolute bottom-0 left-0 w-full ${bar.fill} bg-secondary`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function LandingPage({ onLaunchChat }: LandingPageProps) {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-line", {
        opacity: 0,
        y: 40,
        duration: 1.1,
        stagger: 0.14,
        ease: "power3.out",
        delay: 0.15,
      });
      gsap.from(".hero-body", {
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 0.6,
        ease: "power3.out",
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body overflow-x-hidden">

      {/* ── NAVBAR ───────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-8 md:px-12 py-5 flex items-center justify-between">
        <span className="font-headline text-2xl text-primary italic tracking-tight">Ruixen AI</span>
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "The Method", href: "#method" },
            { label: "ATS Analysis", href: "#results" },
            { label: "Consultation", href: "#start" },
          ].map(({ label, href }) => (
            <a key={label} href={href} className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors duration-150">
              {label}
            </a>
          ))}
        </div>
        <button
          onClick={onLaunchChat}
          className="bg-primary text-white px-6 py-2.5 rounded-full font-label text-xs uppercase tracking-widest hover:bg-secondary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 active:scale-95"
        >
          Begin Curation
        </button>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex flex-col justify-center px-8 md:px-12 overflow-hidden bg-white pt-24">
        <div ref={heroRef} className="z-10 max-w-6xl mx-auto w-full">
          <h1
            className="font-headline italic text-bleed text-primary relative mb-12"
            style={{ fontSize: "clamp(4rem, 11vw, 11rem)" }}
          >
            <span className="hero-line block">YOUR RESUME IS</span>
            <span className="hero-line block text-on-surface" style={{ marginLeft: "clamp(2rem, 8vw, 10rem)" }}>
              HOLDING YOU
            </span>
            <span className="hero-line block text-secondary italic">BACK.</span>
          </h1>
          <div className="hero-body flex flex-col md:flex-row gap-12 items-center mt-10">
            <p className="text-xl font-light text-on-surface-variant leading-relaxed max-w-md opacity-80">
              Ruixen AI is a bespoke career architect that rewrites and optimizes your resume to beat Applicant Tracking Systems, match job descriptions, and secure more interviews with uncompromising precision.
            </p>
            <button
              onClick={onLaunchChat}
              className="bg-primary text-white px-10 py-5 rounded-full font-headline italic text-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] flex-shrink-0"
            >
              Explore the Method
            </button>
          </div>
        </div>
      </section>

      {/* ── THE ART OF CURATION ──────────────────────────────────────────────── */}
      <section id="method" className="py-40 md:py-64 px-8 md:px-12 relative bg-[#fdfdfd] overflow-hidden">
        <div className="max-w-7xl mx-auto relative">

          {/* Header */}
          <RevealUp className="mb-24 md:mb-40 text-center">
            <h2
              className="font-headline italic text-primary inline-block relative"
              style={{ fontSize: "clamp(3rem, 7vw, 7rem)" }}
            >
              The Art of Curation
              <span className="absolute -bottom-3 left-0 w-1/2 h-px bg-primary/15" />
            </h2>
          </RevealUp>

          <div className="space-y-40 md:space-y-64">

            {/* ── Step 01: Upload ── */}
            <RevealUp className="relative flex flex-col md:flex-row items-center gap-12 md:gap-20">
              {/* Ghost number */}
              <div
                className="absolute -left-8 md:-left-12 top-0 font-headline italic text-zinc-100 leading-none select-none -z-10 hidden lg:block"
                style={{ fontSize: "clamp(8rem, 18vw, 18rem)" }}
                aria-hidden
              >
                01
              </div>
              {/* Text */}
              <div className="md:w-1/2 space-y-6 z-10">
                <h3 className="font-headline italic uppercase tracking-tighter text-primary" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
                  Upload
                </h3>
                <p className="text-xl font-light text-on-surface-variant leading-relaxed max-w-md">
                  Review, analyze, and illuminate. Our diagnostic engine performs a thorough structural audit against global professional benchmarks.
                </p>
              </div>
              {/* Visual: browser mockup */}
              <div className="md:w-1/2 relative">
                <div className="w-full aspect-[4/3] bg-surface-container-high/40 rounded-3xl overflow-hidden soft-shadow relative float-anim">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 bg-white p-6 rounded-xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                    <div className="space-y-2.5">
                      <div className="h-2 w-3/4 bg-zinc-100 rounded-full" />
                      <div className="h-2 w-full bg-zinc-100 rounded-full" />
                      <div className="h-2 w-1/2 bg-primary/20 rounded-full border-l-2 border-primary pl-1" />
                      <div className="h-2 w-5/6 bg-zinc-100 rounded-full" />
                      <div className="h-2 w-2/3 bg-zinc-100 rounded-full" />
                    </div>
                    <div className="mt-5 flex justify-end">
                      <span className="font-label text-[10px] text-primary bg-primary/5 px-2.5 py-1 rounded-full">
                        ANALYZING STRUCTURE...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </RevealUp>

            {/* ── Step 02: Refine ── */}
            <RevealUp className="relative flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
              {/* Ghost number */}
              <div
                className="absolute -right-8 md:-right-12 top-0 font-headline italic text-zinc-100 leading-none select-none -z-10 hidden lg:block"
                style={{ fontSize: "clamp(8rem, 18vw, 18rem)" }}
                aria-hidden
              >
                02
              </div>
              {/* Text */}
              <div className="md:w-1/2 space-y-6 z-10 text-right md:pr-10">
                <h3 className="font-headline italic uppercase tracking-tighter text-secondary" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
                  Refine
                </h3>
                <p className="text-xl font-light text-on-surface-variant leading-relaxed max-w-md ml-auto">
                  Intelligent narrative alignment and curated vocabulary enhancement. A total stylistic evolution delivered with uncompromising precision.
                </p>
              </div>
              {/* Visual: circle gauge */}
              <div className="md:w-1/2 max-w-xs mx-auto md:mx-0">
                <CircleGauge />
              </div>
            </RevealUp>

            {/* ── Step 03: Distill ── */}
            <RevealUp className="relative flex flex-col md:flex-row items-center gap-12 md:gap-20">
              {/* Ghost number */}
              <div
                className="absolute left-1/4 -top-16 font-headline italic text-zinc-100 leading-none select-none -z-10 hidden lg:block"
                style={{ fontSize: "clamp(8rem, 18vw, 18rem)" }}
                aria-hidden
              >
                03
              </div>
              {/* Text */}
              <div className="md:w-1/2 space-y-6 z-10">
                <h3 className="font-headline italic uppercase tracking-tighter text-primary" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
                  Distill
                </h3>
                <p className="text-xl font-light text-on-surface-variant leading-relaxed max-w-md">
                  Receive a bespoke professional dossier, including your{" "}
                  <span className="underline decoration-secondary underline-offset-4 decoration-1">curated resume</span>{" "}
                  and a strategic intelligence report optimized for elite networks.
                </p>
              </div>
              {/* Visual: file cards */}
              <div className="md:w-1/2">
                <div className="relative grid grid-cols-2 gap-4 float-anim max-w-sm mx-auto md:mx-0">
                  <div className="bg-white p-8 rounded-3xl soft-shadow border border-zinc-100 -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center mb-5">
                      <FileText size={18} className="text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="font-label text-[9px] text-on-surface-variant/40 mb-3 uppercase tracking-widest">
                      CURATED_RESUME.PDF
                    </div>
                    <div className="h-1 w-full bg-zinc-100 rounded-full" />
                  </div>
                  <div className="bg-primary p-8 rounded-3xl shadow-2xl translate-y-10 rotate-3 hover:rotate-0 transition-transform duration-500 text-white">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-5">
                      <TrendingUp size={18} className="text-white" strokeWidth={1.5} />
                    </div>
                    <div className="font-label text-[9px] text-white/50 mb-3 uppercase tracking-widest">
                      MARKET_REPORT.INTEL
                    </div>
                    <div className="h-1 w-full bg-white/20 rounded-full" />
                  </div>
                </div>
              </div>
            </RevealUp>

          </div>
        </div>
      </section>

      {/* ── MARKET ELEVATION ─────────────────────────────────────────────────── */}
      <section id="results" className="py-40 px-8 md:px-12 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: headline + stats */}
          <div className="relative">
            <RevealUp>
              <h2
                className="font-headline italic text-bleed text-on-surface mb-20 uppercase"
                style={{ fontSize: "clamp(3.5rem, 8vw, 8rem)" }}
              >
                MARKET <br />
                <span className="text-primary">ELEVATION.</span>
              </h2>
            </RevealUp>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { val: 94, suffix: "%", label: "ENGAGEMENT", color: "bg-primary/20" },
                { val: 99, suffix: "%", label: "SYSTEM HARMONY", color: "bg-secondary/20" },
              ].map(({ val, suffix, label, color }, i) => (
                <RevealUp key={label} delay={i * 0.1} className="group">
                  <div
                    className="font-label font-bold tracking-tighter mb-2 transition-transform group-hover:scale-105 duration-500"
                    style={{ fontSize: "clamp(3rem, 6vw, 5rem)", color: i === 0 ? "#001cbf" : "#ba002c", opacity: 0.9 }}
                  >
                    <Counter value={val} suffix={suffix} />
                  </div>
                  <div className="font-label text-[10px] uppercase tracking-[0.3em] text-outline/60 mb-3">{label}</div>
                  <div className={`w-12 h-1 ${color} rounded-full group-hover:w-full transition-all duration-700`} />
                </RevealUp>
              ))}
            </div>
          </div>

          {/* Right: advantage card */}
          <RevealUp delay={0.1}>
            <div className="glass-panel p-12 md:p-16 rounded-[64px] soft-shadow relative z-10 border border-zinc-100">
              <h3 className="font-headline italic text-3xl md:text-4xl mb-12 uppercase text-primary">
                The Curation Advantage
              </h3>
              <ul className="space-y-10">
                {[
                  {
                    icon: <Sparkles size={22} strokeWidth={1.5} />,
                    title: "BEYOND TEMPLATES",
                    body: "We reject the generic. We distill a singular professional narrative that commands attention and inspires confidence.",
                  },
                  {
                    icon: <LayoutGrid size={22} strokeWidth={1.5} />,
                    title: "340+ ECOSYSTEMS",
                    body: "Precision alignment across Workday, Taleo, Greenhouse, and every premium talent gateway.",
                  },
                  {
                    icon: <TrendingUp size={22} strokeWidth={1.5} />,
                    title: "REAL-TIME INTELLIGENCE",
                    body: "Instant feedback loops derived from global market trends and executive leadership preferences.",
                  },
                ].map(({ icon, title, body }) => (
                  <li key={title} className="flex items-start gap-7 group">
                    <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center shrink-0 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-label font-bold text-[11px] uppercase tracking-widest mb-2 text-on-surface">
                        {title}
                      </h4>
                      <p className="text-on-surface-variant text-sm leading-relaxed opacity-70">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </RevealUp>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section id="start" className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden px-8 md:px-12 py-32 bg-white">
        {/* Radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,28,191,0.04)_0%,transparent_60%)] pointer-events-none" />
        {/* Organic blob */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] organic-shape bg-primary/[0.02] blur-[100px] pointer-events-none"
        />

        <div className="relative z-10 text-center max-w-4xl">
          <RevealUp>
            <h2
              className="font-headline italic text-on-surface uppercase tracking-tight mb-16"
              style={{ fontSize: "clamp(3.5rem, 10vw, 10rem)", lineHeight: 0.85 }}
            >
              LEAVE THE <br />
              <span className="text-primary">COMMON</span> <br />
              BEHIND.
            </h2>
            <button
              onClick={onLaunchChat}
              className="bg-primary text-white px-10 py-5 rounded-full font-headline italic text-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              Begin Your Curation
            </button>
          </RevealUp>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-white px-8 md:px-12 py-20 relative overflow-hidden border-t border-zinc-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-end gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <span className="font-headline text-3xl text-primary italic tracking-tight">Ruixen AI</span>
            <p className="font-label text-[9px] text-zinc-400 uppercase tracking-[0.3em] text-center md:text-left">
              © 2025 RUIXEN AI. REFINED INTELLIGENCE METHODOLOGY.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-10">
            {["The Method", "Privacy", "Terms", "Inquiry"].map((l) => (
              <a
                key={l}
                href="#"
                className="font-label text-[9px] text-zinc-400 uppercase tracking-[0.2em] hover:text-primary transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
