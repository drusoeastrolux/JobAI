import { useEffect, useRef, useState } from "react";
import { ArrowRight, BadgeCheck, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LandingPageProps {
  onLaunchChat: () => void;
}

/* ── Directional Hover Fill Button ───────────────────────────────────────── */
function DirectionalButton({
  onClick,
  children,
  className = "",
  fillClassName = "bg-primary-dim",
  style,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  fillClassName?: string;
  style?: React.CSSProperties;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  const getTranslate = (e: React.MouseEvent) => {
    if (!btnRef.current) return "translateX(-101%)";
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;
    if (Math.abs(x - w / 2) > Math.abs(y - h / 2)) {
      return x < w / 2 ? "translateX(-101%)" : "translateX(101%)";
    }
    return y < h / 2 ? "translateY(-101%)" : "translateY(101%)";
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!fillRef.current) return;
    const t = getTranslate(e);
    fillRef.current.style.transition = "none";
    fillRef.current.style.transform = t;
    fillRef.current.getBoundingClientRect();
    fillRef.current.style.transition =
      "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
    fillRef.current.style.transform = "translate(0, 0)";
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (!fillRef.current) return;
    fillRef.current.style.transition =
      "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
    fillRef.current.style.transform = getTranslate(e);
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={cn("relative overflow-hidden", className)}
    >
      <span
        ref={fillRef}
        className={cn("absolute inset-0", fillClassName)}
        style={{ transform: "translateX(-101%)", willChange: "transform" }}
      />
      <span className="relative z-[1] flex items-center gap-2">{children}</span>
    </button>
  );
}

/* ── Scroll-triggered Fade-in ─────────────────────────────────────────────── */
function FadeInSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Animated Counter Stat ────────────────────────────────────────────────── */
function CounterStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const [displayed, setDisplayed] = useState(() =>
    value.startsWith("<") ? value : "0"
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        observer.disconnect();
        if (value.startsWith("<")) {
          setDisplayed(value);
          return;
        }
        const hasX = value.includes("x");
        const hasPercent = value.includes("%");
        const numStr = value.replace(/[^0-9.]/g, "");
        const target = parseFloat(numStr);
        const isDecimal = numStr.includes(".");
        const duration = 1800;
        const startTime = performance.now();
        const tick = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = target * eased;
          let str = isDecimal
            ? current.toFixed(1)
            : Math.round(current).toLocaleString();
          if (hasX) str += "x";
          if (hasPercent) str += "%";
          setDisplayed(str);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="flex flex-col items-center py-8 px-6">
      <span className="font-headline text-3xl text-on-surface tracking-tight italic">
        {displayed}
      </span>
      <span className="text-xs text-on-surface-variant mt-1.5 tracking-[0.1em] font-body">
        {label}
      </span>
    </div>
  );
}

/* ── Kinetic Marquee Strip ────────────────────────────────────────────────── */
function MarqueeStrip() {
  const items = [
    "ATS Optimization",
    "Resume Rewriting",
    "Interview Prep",
    "Cover Letters",
    "Job Matching",
    "Salary Negotiation",
    "LinkedIn Optimization",
    "Career Strategy",
    "Offer Negotiation",
    "Executive Positioning",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="border-y border-surface-container bg-surface overflow-hidden py-4">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-5 px-5">
            <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-outline-variant">
              {item}
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant/60 flex-shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Resume Document Mockup ───────────────────────────────────────────────── */
function ResumeDocumentCard() {
  return (
    <div className="bg-surface-container-lowest w-full h-full rounded-2xl p-10 relative overflow-hidden ring-1 ring-white/60">
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none rounded-2xl"
        style={{
          backgroundImage: "var(--paper-grain)",
          backgroundSize: "200px 200px",
        }}
      />
      <div
        className="absolute top-0 right-0 w-52 h-52 rounded-bl-full blur-3xl"
        style={{ background: "rgba(119,90,25,0.06)" }}
      />

      {/* Name block */}
      <div className="mb-8 pb-6 border-b border-primary/10">
        <div className="w-44 h-5 bg-on-surface/90 rounded-sm mb-2.5" />
        <div
          className="w-28 h-3 rounded-sm mb-3 border-l-2 border-primary/40 pl-2"
          style={{ background: "rgba(119,90,25,0.25)" }}
        />
        <div className="flex gap-3">
          <div className="w-20 h-2 bg-surface-container rounded-sm" />
          <div className="w-16 h-2 bg-surface-container rounded-sm" />
        </div>
      </div>

      {/* Experience */}
      <div className="mb-7">
        <div
          className="w-20 h-2.5 rounded-sm mb-4"
          style={{ background: "rgba(119,90,25,0.35)" }}
        />
        <div className="space-y-2.5">
          {([1, 0.9, 0.75, "accent", 1, 0.7] as (number | "accent")[]).map(
            (w, i) => (
              <div
                key={i}
                className="h-2 rounded-full"
                style={{
                  width: `${(w === "accent" ? 0.85 : w) * 100}%`,
                  background:
                    w === "accent"
                      ? "rgba(119,90,25,0.22)"
                      : "rgba(47,51,51,0.07)",
                }}
              />
            )
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-7">
        <div
          className="w-14 h-2.5 rounded-sm mb-4"
          style={{ background: "rgba(119,90,25,0.35)" }}
        />
        <div className="flex gap-2 flex-wrap">
          {[52, 68, 44, 60, 48].map((w, i) => (
            <div
              key={i}
              className="h-5 rounded-full border border-primary/10"
              style={{
                width: `${w}px`,
                background: "rgba(255,222,165,0.45)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Education */}
      <div>
        <div
          className="w-24 h-2.5 rounded-sm mb-4"
          style={{ background: "rgba(119,90,25,0.35)" }}
        />
        <div className="space-y-2">
          {[0.8, 0.6].map((w, i) => (
            <div
              key={i}
              className="h-2 rounded-full"
              style={{
                width: `${w * 100}%`,
                background: "rgba(47,51,51,0.07)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── AI Insight Glassmorphism Card ────────────────────────────────────────── */
function AIInsightGlassCard() {
  return (
    <div className="glass-panel p-7 rounded-2xl w-72">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="p-2 rounded-lg"
          style={{ background: "rgba(119,90,25,0.15)" }}
        >
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <span className="font-headline italic text-base text-on-surface">
          AI Insight
        </span>
      </div>
      <div className="space-y-3 mb-5">
        {[1, 0.75, 5 / 6].map((w, i) => (
          <div
            key={i}
            className="h-2 rounded-full animate-pulse"
            style={{
              width: `${w * 100}%`,
              background: "rgba(119,90,25,0.12)",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <div className="pt-4 border-t" style={{ borderColor: "rgba(119,90,25,0.1)" }}>
        <p className="font-headline italic text-on-surface-variant text-sm leading-relaxed">
          "Strengthen the opening to emphasize measurable leadership outcomes."
        </p>
      </div>
    </div>
  );
}

/* ── Workshop Mini Demos ──────────────────────────────────────────────────── */

function RewriteMiniDemo() {
  const [phase, setPhase] = useState<"before" | "after">("before");

  useEffect(() => {
    const alive = { current: true };
    let timer = 0;

    const cycle = (current: "before" | "after") => {
      if (!alive.current) return;
      setPhase(current);
      timer = window.setTimeout(
        () => cycle(current === "before" ? "after" : "before"),
        current === "before" ? 1800 : 2600
      );
    };

    timer = window.setTimeout(() => cycle("before"), 400);
    return () => {
      alive.current = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="w-60 rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container-lowest text-[10px] shrink-0">
      <div className="px-4 py-2.5 border-b border-outline-variant/15 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse-dot" />
        <span className="text-on-surface-variant tracking-wide font-medium uppercase">
          AI rewriting
        </span>
      </div>
      <div className="px-4 py-3 min-h-[3.5rem] flex flex-col justify-center gap-2">
        <p
          className="leading-snug transition-all duration-400"
          style={{
            color:
              phase === "after" ? "rgba(47,51,51,0.25)" : "rgba(47,51,51,0.5)",
            textDecoration: phase === "after" ? "line-through" : "none",
          }}
        >
          Helped manage social media accounts
        </p>
        <p
          className="text-on-surface font-medium leading-snug transition-all duration-500"
          style={{
            opacity: phase === "after" ? 1 : 0,
            transform: `translateY(${phase === "after" ? 0 : 4}px)`,
          }}
        >
          Grew Instagram 340% in 6 months, 47K followers
        </p>
      </div>
    </div>
  );
}

function ATSScoreDemo() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    let frameId = 0;
    let loopId = 0;
    let startTime = 0;
    const duration = 1400;
    const target = 94;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setScore(Math.round(target * eased));
      if (progress < 1) frameId = requestAnimationFrame(animate);
    };

    const cycle = () => {
      cancelAnimationFrame(frameId);
      startTime = 0;
      setScore(0);
      frameId = requestAnimationFrame(animate);
    };

    cycle();
    loopId = window.setInterval(cycle, 4200);

    return () => {
      cancelAnimationFrame(frameId);
      clearInterval(loopId);
    };
  }, []);

  return (
    <div className="w-60 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-4 text-[10px] shrink-0">
      <div className="flex justify-between items-center mb-3">
        <span className="text-on-surface-variant tracking-wide font-medium uppercase">
          ATS Match Score
        </span>
        <span className="font-mono text-primary font-bold text-xs tabular-nums">
          {score}%
        </span>
      </div>
      <div className="h-1.5 bg-surface-container rounded-full overflow-hidden mb-2.5">
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            background: "#775a19",
            transition: "width 0.05s linear",
          }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-on-surface/30">Keyword relevance</span>
        <span
          className="font-medium transition-colors duration-300"
          style={{ color: score > 85 ? "#775a19" : "rgba(47,51,51,0.4)" }}
        >
          {score > 85 ? "Strong" : score > 55 ? "Building..." : "Scanning..."}
        </span>
      </div>
    </div>
  );
}

function MatchListDemo() {
  const jobs = [
    { title: "Senior PM", company: "Vanta", fit: "97%" },
    { title: "Dir. of Product", company: "Coda", fit: "91%" },
    { title: "Product Lead", company: "Retool", fit: "88%" },
  ] as const;

  const [shown, setShown] = useState(0);

  useEffect(() => {
    const alive = { current: true };
    let timer = 0;

    const advance = (n: number) => {
      if (!alive.current) return;
      if (n <= jobs.length) {
        setShown(n);
        timer = window.setTimeout(() => advance(n + 1), 480);
      } else {
        timer = window.setTimeout(() => {
          if (!alive.current) return;
          setShown(0);
          timer = window.setTimeout(() => advance(1), 500);
        }, 2400);
      }
    };

    timer = window.setTimeout(() => advance(1), 700);
    return () => {
      alive.current = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="w-60 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-[10px] overflow-hidden shrink-0">
      <div className="px-4 py-2.5 border-b border-outline-variant/15 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse-dot" />
        <span className="text-on-surface-variant tracking-wide font-medium uppercase">
          Top matches
        </span>
      </div>
      <div className="px-4 py-2 space-y-0.5">
        {jobs.map((job, i) => (
          <div
            key={job.title}
            className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0"
            style={{
              opacity: shown > i ? 1 : 0,
              transform: `translateY(${shown > i ? 0 : 5}px)`,
              transition: "opacity 0.35s ease, transform 0.35s ease",
            }}
          >
            <div>
              <p className="text-on-surface font-semibold">{job.title}</p>
              <p className="text-on-surface/40 mt-0.5">{job.company}</p>
            </div>
            <span className="font-mono font-bold text-primary">{job.fit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Workshop Row ─────────────────────────────────────────────────────────── */
function WorkshopRow({
  num,
  title,
  desc,
  demo,
  delay = 0,
}: {
  num: string;
  title: string;
  desc: string;
  demo: React.ReactNode;
  delay?: number;
}) {
  return (
    <FadeInSection delay={delay}>
      <div className="group grid grid-cols-1 md:grid-cols-[64px_1fr_1.35fr_auto] gap-x-10 gap-y-3 py-10 lg:py-14 border-t border-outline-variant/20 items-start -mx-6 px-6 md:-mx-16 md:px-16 hover:bg-primary/[0.025] transition-colors duration-300 rounded-sm">
        <span className="font-mono text-5xl font-light leading-none select-none transition-colors duration-300" style={{ color: "rgba(119,90,25,0.15)" }}>
          {num}
        </span>
        <h3 className="font-headline text-2xl md:text-3xl italic text-on-surface group-hover:text-primary transition-colors duration-300 leading-tight pt-1">
          {title}
        </h3>
        <p className="font-body text-on-surface-variant leading-relaxed text-[0.9rem] font-light max-w-[52ch]">
          {desc}
        </p>
        <div className="hidden md:block">{demo}</div>
      </div>
    </FadeInSection>
  );
}

/* ── Main Landing Page ────────────────────────────────────────────────────── */
export default function LandingPage({ onLaunchChat }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);
  const resumeCardRef = useRef<HTMLDivElement>(null);
  const aiCardRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const mx = (e.clientX - cx) / cx;
      const my = (e.clientY - cy) / cy;

      if (resumeCardRef.current) {
        resumeCardRef.current.style.transform = `rotateY(${-12 + mx * 4}deg) rotateX(${5 + my * 3}deg) translate(${mx * 8}px, ${my * 6}px)`;
      }
      if (aiCardRef.current) {
        aiCardRef.current.style.transform = `translate(${mx * 18}px, ${my * 14}px)`;
      }
      if (bgTextRef.current) {
        bgTextRef.current.style.transform = `translateX(${mx * -22}px)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body overflow-x-hidden">
      {/* Paper grain — fixed, pointer-events-none */}
      <div
        className="fixed inset-0 z-[100] pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "var(--paper-grain)",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 border-b border-white/20"
        style={{
          background: "rgba(250,249,248,0.65)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <span className="font-headline text-xl font-bold tracking-tighter text-on-surface">
          Ruixen<span className="italic text-primary"> AI</span>
        </span>

        <div className="hidden md:flex items-center gap-10">
          <a
            href="#features"
            className="font-headline italic text-lg text-primary border-b border-primary pb-0.5 hover:opacity-75 transition-opacity"
          >
            How It Works
          </a>
          <a
            href="#transformation"
            className="font-headline italic text-lg text-on-surface/70 hover:text-primary transition-colors"
          >
            Results
          </a>
          <a
            href="#testimonial"
            className="font-headline italic text-lg text-on-surface/70 hover:text-primary transition-colors"
          >
            Stories
          </a>
        </div>

        <DirectionalButton
          onClick={onLaunchChat}
          fillClassName="bg-primary-dim"
          className="flex items-center gap-2 px-7 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-full uppercase tracking-widest font-body active:scale-[0.98]"
          style={{
            boxShadow:
              "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          Get Started
        </DirectionalButton>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden"
      >
        {/* Large italic background text */}
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
          <div
            ref={bgTextRef}
            className="text-[20vw] font-headline italic select-none whitespace-nowrap"
            style={{
              color: "rgba(119,90,25,0.04)",
              transition: "transform 0.12s ease-out",
              willChange: "transform",
            }}
          >
            Career Excellence
          </div>
        </div>

        {/* Background ambient */}
        <div
          className="absolute top-0 right-0 -z-10 w-[700px] h-[700px] rounded-full blur-[150px]"
          style={{ background: "rgba(119,90,25,0.05)" }}
        />

        <div className="max-w-[1440px] mx-auto px-8 lg:px-16 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-12 lg:gap-20 items-center">
            {/* Left: Copy */}
            <div>
              <h1
                className={`font-headline text-6xl md:text-[7rem] leading-[1] text-on-surface mb-8 ${
                  mounted ? "animate-fade-in-up" : "opacity-0"
                }`}
              >
                The craft of
                <br />
                <span className="italic text-primary">getting hired.</span>
              </h1>

              <p
                className={`font-body text-xl text-on-surface-variant max-w-xl mb-12 leading-relaxed font-light ${
                  mounted ? "animate-fade-in-up delay-100" : "opacity-0"
                }`}
              >
                Paste your resume, describe the role you want, and get
                expert-level rewrites, ATS optimization, and precise job
                matches — all in one conversation.
              </p>

              <div
                className={`flex flex-col sm:flex-row gap-4 ${
                  mounted ? "animate-fade-in-up delay-200" : "opacity-0"
                }`}
              >
                <DirectionalButton
                  onClick={onLaunchChat}
                  fillClassName="bg-primary-dim"
                  className="flex items-center gap-2 px-10 py-5 bg-primary text-on-primary text-xs font-bold rounded-full uppercase tracking-[0.2em] font-body active:scale-[0.98]"
                  style={{
                    boxShadow:
                      "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  Begin Your Story
                  <ArrowRight className="w-3.5 h-3.5" />
                </DirectionalButton>

                <a
                  href="#features"
                  className="flex items-center justify-center gap-2 px-10 py-5 text-on-surface text-xs font-bold rounded-full border border-outline-variant/30 hover:border-primary/50 hover:text-primary transition-all uppercase tracking-[0.2em] font-body"
                >
                  View Sample
                  <ChevronDown className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Right: 3D Resume Card */}
            <div
              className="hidden lg:block relative"
              style={{ perspective: "1500px" }}
            >
              <div
                ref={resumeCardRef}
                className="relative w-full aspect-[4/5] rounded-2xl overflow-visible"
                style={{
                  transform: "rotateY(-12deg) rotateX(5deg)",
                  transition: "transform 0.12s ease-out",
                  willChange: "transform",
                  boxShadow:
                    "0 20px 40px -15px rgba(47,51,51,0.15), 0 15px 25px -10px rgba(47,51,51,0.10)",
                }}
              >
                <ResumeDocumentCard />

                {/* Floating AI insight card */}
                <div
                  ref={aiCardRef}
                  className="absolute -top-14 -right-10 z-20 hidden md:block"
                  style={{
                    transition: "transform 0.12s ease-out",
                    willChange: "transform",
                  }}
                >
                  <AIInsightGlassCard />
                </div>

                {/* Ambient depth glow */}
                <div
                  className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full -z-10 blur-[100px]"
                  style={{ background: "rgba(119,90,25,0.22)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Workshop (Features) ───────────────────────────────────────── */}
      <section
        id="features"
        className="pt-32 md:pt-48 pb-12 md:pb-16 px-6 md:px-16 relative bg-surface"
      >
        <div className="max-w-[1440px] mx-auto">
          <FadeInSection className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
            <div>
              <span className="font-body text-primary uppercase tracking-[0.4em] text-xs font-extrabold mb-5 block">
                The Workshop
              </span>
              <h2 className="font-headline text-4xl md:text-6xl text-on-surface leading-tight">
                How Ruixen works.
              </h2>
            </div>
            <p className="font-body text-on-surface-variant max-w-xs text-base leading-relaxed font-light md:text-right pb-1">
              Three capabilities. One conversation. Every step of your search covered.
            </p>
          </FadeInSection>

          <div>
            <WorkshopRow
              num="01"
              title="Resume rewriting that lands"
              desc="Paste your resume and Ruixen rewrites every bullet — turning vague responsibilities into measurable outcomes, fixing weak verbs, and tuning the language for the ATS filters that discard you before a human reads your name."
              demo={<RewriteMiniDemo />}
              delay={0}
            />
            <WorkshopRow
              num="02"
              title="ATS keywords, invisibly woven"
              desc="Invisible to the eye but essential for the system. We embed high-impact industry keywords into your natural voice — so your resume reads like you wrote it, not like a keyword dump."
              demo={<ATSScoreDemo />}
              delay={0.05}
            />
            <WorkshopRow
              num="03"
              title="Job matches that actually fit"
              desc="Describe what you want and Ruixen surfaces roles that genuinely align with your background. Every match comes with a clear explanation of why it fits and what to emphasize in your application."
              demo={<MatchListDemo />}
              delay={0.1}
            />
          </div>
        </div>
      </section>

      {/* ── The Transformation (Before / After) ──────────────────────────── */}
      <section
        id="transformation"
        className="py-16 md:py-24 px-6 bg-surface overflow-hidden relative"
      >
        <div className="max-w-[1440px] mx-auto">
          <FadeInSection className="text-center mb-24">
            <span className="font-body text-primary uppercase tracking-[0.4em] text-xs font-extrabold mb-6 block">
              The Transformation
            </span>
            <h2 className="font-headline text-4xl md:text-6xl text-on-surface italic">
              A Visible Evolution
            </h2>
          </FadeInSection>

          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 items-center px-0 md:px-16"
            style={{ perspective: "1500px" }}
          >
            {/* Before */}
            <FadeInSection>
              <div
                className="relative space-y-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-60 transition-all duration-700"
                style={{ transform: "rotateY(12deg) rotateX(5deg)" }}
              >
                <span className="absolute -top-4 -left-4 bg-on-surface text-surface px-5 py-2 text-[10px] tracking-[0.3em] font-bold uppercase z-20 shadow-lg">
                  Legacy
                </span>
                <div className="bg-white p-8 border border-outline-variant/30 shadow-2xl aspect-[3/4] flex flex-col justify-start relative overflow-hidden">
                  {/* Name */}
                  <div className="mb-5 pb-4 border-b border-on-surface/10">
                    <p className="text-[11px] font-bold text-on-surface/40 tracking-wider uppercase mb-0.5">Jordan Mitchell</p>
                    <p className="text-[9px] text-on-surface/30 tracking-wide">jordan@email.com · linkedin.com/in/jordan</p>
                  </div>
                  {/* Experience */}
                  <div className="mb-4">
                    <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-on-surface/30 mb-2">Experience</p>
                    <div className="mb-3">
                      <p className="text-[9px] font-semibold text-on-surface/40">Social Media Manager — Acme Co.</p>
                      <p className="text-[8px] text-on-surface/25 mb-1.5">2021 – Present</p>
                      <ul className="space-y-1">
                        {[
                          "Responsible for managing social media accounts",
                          "Helped with content creation and posting",
                          "Worked on increasing followers and engagement",
                          "Assisted with marketing campaigns",
                        ].map((line) => (
                          <li key={line} className="text-[8.5px] text-on-surface/30 flex gap-1.5">
                            <span className="mt-[3px] flex-shrink-0">–</span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-on-surface/40">Marketing Assistant — Generic Corp.</p>
                      <p className="text-[8px] text-on-surface/25 mb-1.5">2019 – 2021</p>
                      <ul className="space-y-1">
                        {[
                          "Helped with various marketing tasks",
                          "Supported team with reports and analysis",
                        ].map((line) => (
                          <li key={line} className="text-[8.5px] text-on-surface/30 flex gap-1.5">
                            <span className="mt-[3px] flex-shrink-0">–</span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {/* Skills */}
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-on-surface/30 mb-2">Skills</p>
                    <p className="text-[8.5px] text-on-surface/30">Social Media, Content, Marketing, Excel, PowerPoint</p>
                  </div>
                </div>
                <p className="font-headline italic text-center text-on-surface-variant text-lg">
                  Functional, but forgettable.
                </p>
              </div>
            </FadeInSection>

            {/* After */}
            <FadeInSection delay={0.15}>
              <div
                className="relative space-y-8 group"
                style={{ transform: "rotateY(-12deg) rotateX(5deg)" }}
              >
                <span
                  className="absolute -top-4 -right-4 text-on-primary px-5 py-2 text-[10px] tracking-[0.3em] font-bold uppercase z-20 shadow-xl"
                  style={{ background: "#775a19" }}
                >
                  Curated
                </span>
                <div
                  className="bg-surface-container-lowest p-8 aspect-[3/4] flex flex-col justify-start relative overflow-hidden rounded-sm group-hover:scale-[1.02] transition-transform duration-500"
                  style={{
                    boxShadow:
                      "0 20px 40px -15px rgba(47,51,51,0.12), 0 15px 25px -10px rgba(47,51,51,0.08)",
                    outline: "1px solid rgba(119,90,25,0.15)",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.02] pointer-events-none"
                    style={{
                      backgroundImage: "var(--paper-grain)",
                      backgroundSize: "200px 200px",
                    }}
                  />
                  <div
                    className="absolute top-0 right-0 w-36 h-36 rounded-bl-full blur-2xl"
                    style={{ background: "rgba(119,90,25,0.06)" }}
                  />
                  {/* Name */}
                  <div className="mb-5 pb-4 border-b border-primary/15">
                    <p className="text-[11px] font-bold text-on-surface tracking-wider uppercase mb-0.5">Jordan Mitchell</p>
                    <p className="text-[9px] text-primary/70 tracking-wide font-medium border-l-2 border-primary/30 pl-2">Growth & Brand Strategist</p>
                    <p className="text-[9px] text-on-surface/40 mt-0.5 tracking-wide">jordan@email.com · linkedin.com/in/jordan</p>
                  </div>
                  {/* Experience */}
                  <div className="mb-4">
                    <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-primary/60 mb-2">Experience</p>
                    <div className="mb-3">
                      <p className="text-[9px] font-semibold text-on-surface">Social Media Manager — Acme Co.</p>
                      <p className="text-[8px] text-on-surface/40 mb-1.5">2021 – Present</p>
                      <ul className="space-y-1">
                        {[
                          "Grew Instagram 340% in 6 months, driving 47K new followers and a 4.2% engagement rate",
                          "Launched 3 campaigns that generated $280K in attributed pipeline",
                          "Reduced content production time by 40% by building a reusable asset library",
                        ].map((line) => (
                          <li key={line} className="text-[8.5px] text-on-surface/60 flex gap-1.5">
                            <span className="mt-[3px] text-primary flex-shrink-0">▸</span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-on-surface">Marketing Assistant — Generic Corp.</p>
                      <p className="text-[8px] text-on-surface/40 mb-1.5">2019 – 2021</p>
                      <ul className="space-y-1">
                        {[
                          "Authored 12 long-form reports adopted across 4 regional offices",
                          "Coordinated 6-person cross-functional team, delivering all milestones on schedule",
                        ].map((line) => (
                          <li key={line} className="text-[8.5px] text-on-surface/60 flex gap-1.5">
                            <span className="mt-[3px] text-primary flex-shrink-0">▸</span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {/* Skills */}
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-primary/60 mb-2">Core Competencies</p>
                    <div className="flex flex-wrap gap-1">
                      {["Growth Strategy", "Content Systems", "Brand Voice", "Analytics", "A/B Testing"].map((s) => (
                        <span key={s} className="text-[7.5px] px-2 py-0.5 rounded-full font-medium text-primary/80" style={{ background: "rgba(255,222,165,0.5)", border: "1px solid rgba(119,90,25,0.15)" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Verification badge */}
                  <div
                    className="absolute bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center rotate-12 glass-panel"
                  >
                    <BadgeCheck className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <p className="font-headline italic text-center text-primary text-2xl font-bold">
                  Authoritative. Distinguished.
                </p>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-40 bg-on-surface text-surface">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-16 text-center">
          <FadeInSection>
            <p className="text-xs tracking-[0.2em] uppercase text-outline-variant font-body font-medium mb-6">
              Begin Today
            </p>
            <h2 className="font-headline text-4xl md:text-6xl leading-tight mb-8">
              Ready to land
              <br />
              <span className="italic text-outline-variant">your next role?</span>
            </h2>
            <p className="font-body text-outline-variant text-lg max-w-[46ch] mx-auto mb-12 leading-relaxed font-light">
              Paste your resume and start a conversation. Ruixen gives you the
              edge every job search needs — in minutes, not weeks.
            </p>
            <DirectionalButton
              onClick={onLaunchChat}
              fillClassName="bg-surface-container-low"
              className="inline-flex items-center gap-2 px-10 py-5 bg-surface text-on-surface text-xs font-bold rounded-full tracking-[0.2em] uppercase font-body active:scale-[0.98]"
              style={{
                boxShadow:
                  "0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1)",
              }}
            >
              Revise My Resume
              <ArrowRight className="w-4 h-4" />
            </DirectionalButton>
          </FadeInSection>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer
        className="w-full pt-20 pb-12 border-t border-white/20"
        style={{
          background: "rgba(243,244,243,0.60)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start px-8 md:px-16 max-w-[1920px] mx-auto gap-16 md:gap-0">
          <div className="max-w-sm">
            <div className="font-headline text-xl text-on-surface mb-6">
              Ruixen<span className="italic text-primary"> AI</span>
            </div>
            <p className="font-body text-sm tracking-wide text-on-surface/60 mb-8 leading-relaxed font-light">
              Redefining career presentation through the fusion of human
              editorial insight and machine intelligence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-24 gap-y-10">
            <div className="flex flex-col gap-4">
              <span className="font-bold text-on-surface text-xs uppercase tracking-widest mb-1">
                Platform
              </span>
              <a
                href="#features"
                className="font-body text-sm text-on-surface/60 hover:text-primary transition-colors"
              >
                How It Works
              </a>
              <a
                href="#transformation"
                className="font-body text-sm text-on-surface/60 hover:text-primary transition-colors"
              >
                Results
              </a>
              <button
                onClick={onLaunchChat}
                className="font-body text-sm text-on-surface/60 hover:text-primary transition-colors text-left"
              >
                Launch Chat
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-bold text-on-surface text-xs uppercase tracking-widest mb-1">
                Legal
              </span>
              <a
                href="#"
                className="font-body text-sm text-on-surface/60 hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="font-body text-sm text-on-surface/60 hover:text-primary transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="font-body text-sm text-on-surface/60 hover:text-primary transition-colors"
              >
                Cookie Settings
              </a>
            </div>
          </div>
        </div>

        <div className="px-8 md:px-16 max-w-[1920px] mx-auto mt-16 border-t border-outline-variant/15 pt-8 flex flex-col md:flex-row justify-between gap-4">
          <p className="font-body text-sm text-on-surface/50 font-light">
            © {new Date().getFullYear()} Ruixen AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ── Exported for future use ─────────────────────────────────────────────── */
export { DirectionalButton, FadeInSection };
