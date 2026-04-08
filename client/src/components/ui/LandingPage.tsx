import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LandingPageProps {
  onLaunchChat: () => void;
}

/* ── Directional Hover Fill Button ────────────────────────────────────────── */
function DirectionalButton({
  onClick,
  children,
  className = "",
  fillClassName = "bg-zinc-800",
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  fillClassName?: string;
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
    fillRef.current.getBoundingClientRect(); // force reflow
    fillRef.current.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
    fillRef.current.style.transform = "translate(0, 0)";
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (!fillRef.current) return;
    const t = getTranslate(e);
    fillRef.current.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
    fillRef.current.style.transform = t;
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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

/* ── Scroll-triggered Fade-in Section ─────────────────────────────────────── */
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
      { threshold: 0.12 }
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
    <div ref={ref} className="flex flex-col items-center py-6 px-6">
      <span className="font-display text-3xl font-light text-zinc-950 tracking-tight">
        {displayed}
      </span>
      <span className="text-xs text-zinc-400 mt-1 tracking-wide">{label}</span>
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
    <div className="border-y border-zinc-100 bg-white overflow-hidden py-4">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-5 px-5">
            <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-zinc-350 text-zinc-400">
              {item}
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-200 flex-shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Main Landing Page ────────────────────────────────────────────────────── */
export default function LandingPage({ onLaunchChat }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-zinc-950 font-sans overflow-x-hidden">
      {/* Grain overlay — fixed, pointer-events-none */}
      <div
        className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 py-5 bg-[#fafaf9]/90 backdrop-blur-md border-b border-zinc-100">
        <span className="font-display text-xl font-medium tracking-tight text-zinc-950">
          Ruixen AI
        </span>

        <div className="hidden md:flex items-center gap-8 text-sm text-zinc-500">
          <a
            href="#features"
            className="hover:text-zinc-950 transition-colors duration-200"
          >
            How it works
          </a>
          <a
            href="#testimonials"
            className="hover:text-zinc-950 transition-colors duration-200"
          >
            Stories
          </a>
        </div>

        <DirectionalButton
          onClick={onLaunchChat}
          fillClassName="bg-zinc-800"
          className="flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white text-sm font-medium rounded-full active:scale-[0.98] active:-translate-y-[1px]"
        >
          Get started
          <ArrowRight className="w-3.5 h-3.5" />
        </DirectionalButton>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute inset-0 pointer-events-none isolate">
          <div className="animate-orb-1 absolute -top-32 -left-32 w-[700px] h-[560px] rounded-full bg-amber-300 opacity-70 blur-[60px] mix-blend-multiply" />
          <div className="animate-orb-2 absolute -top-16 -right-16 w-[580px] h-[580px] rounded-full bg-emerald-300 opacity-60 blur-[60px] mix-blend-multiply" />
          <div className="animate-orb-3 absolute bottom-0 left-1/4 w-[700px] h-[380px] rounded-full bg-rose-200 opacity-65 blur-[60px] mix-blend-multiply" />
          <div
            className="animate-orb-1 absolute top-1/3 right-1/4 w-[420px] h-[420px] rounded-full bg-sky-200 opacity-55 blur-[60px] mix-blend-multiply"
            style={{ animationDelay: "-7s" }}
          />
        </div>

        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-16 lg:gap-20 items-center">
            {/* Left — content */}
            <div>
              <h1
                className={`font-display text-5xl md:text-6xl lg:text-[5.5rem] font-light tracking-tight leading-[1.04] text-zinc-950 mb-7 ${
                  mounted ? "animate-fade-in-up" : "opacity-0"
                }`}
              >
                The AI that
                <br />
                <span className="italic">gets you hired</span>
              </h1>

              <p
                className={`text-zinc-500 text-lg leading-relaxed max-w-[52ch] mb-10 ${
                  mounted ? "animate-fade-in-up delay-100" : "opacity-0"
                }`}
              >
                Paste your resume, describe the role you want, and get instant
                expert-level rewrites, ATS optimization, and job matches — all
                in one conversation.
              </p>

              <div
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 ${
                  mounted ? "animate-fade-in-up delay-200" : "opacity-0"
                }`}
              >
                <DirectionalButton
                  onClick={onLaunchChat}
                  fillClassName="bg-zinc-800"
                  className="flex items-center gap-2 px-6 py-3.5 bg-zinc-950 text-white text-sm font-medium rounded-full active:scale-[0.98] active:-translate-y-[1px]"
                >
                  Revise my resume
                  <ArrowRight className="w-4 h-4" />
                </DirectionalButton>

                <a
                  href="#features"
                  className="flex items-center gap-2 px-6 py-3.5 text-zinc-600 text-sm font-medium rounded-full border border-zinc-200 hover:border-zinc-400 hover:text-zinc-950 transition-all duration-200"
                >
                  See how it works
                  <ChevronDown className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Right — rewrite animation */}
            <div
              className={`hidden lg:block ${
                mounted ? "animate-fade-in-up delay-300" : "opacity-0"
              }`}
            >
              <RewriteAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section className="border-y border-zinc-100 bg-white">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-100">
            <CounterStat value="14,392" label="resumes revised this week" />
            <CounterStat value="3.1x" label="more interview callbacks" />
            <CounterStat value="94.7%" label="satisfaction rate" />
            <CounterStat value="< 90s" label="first draft delivered" />
          </div>
        </div>
      </section>

      {/* ── Marquee strip ────────────────────────────────────────────────── */}
      <MarqueeStrip />

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-32">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16">
          <FadeInSection className="mb-20">
            <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 font-medium mb-4">
              How it works
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight leading-tight">
              Your edge in every
              <br />
              <span className="italic text-zinc-400">step of the search.</span>
            </h2>
          </FadeInSection>

          <div className="flex flex-col gap-24">
            {/* Feature 1 */}
            <FadeInSection>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div>
                  <div className="w-8 h-px bg-zinc-950 mb-7" />
                  <h3 className="font-display text-3xl md:text-4xl font-light tracking-tight mb-5 leading-tight">
                    Resume revision
                    <br />
                    that actually lands
                  </h3>
                  <p className="text-zinc-500 leading-relaxed max-w-[48ch]">
                    Paste your resume and Ruixen rewrites every bullet point —
                    turning vague responsibilities into measurable outcomes,
                    fixing weak verbs, and optimizing for the ATS systems that
                    screen you out before a human ever reads your name.
                  </p>
                </div>
                <div className="bg-white border border-zinc-100 rounded-2xl p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.05)]">
                  <ResumeVisual />
                </div>
              </div>
            </FadeInSection>

            {/* Feature 2 */}
            <FadeInSection delay={0.05}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div className="bg-white border border-zinc-100 rounded-2xl p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.05)] order-last md:order-first">
                  <JobMatchVisual />
                </div>
                <div>
                  <div className="w-8 h-px bg-zinc-950 mb-7" />
                  <h3 className="font-display text-3xl md:text-4xl font-light tracking-tight mb-5 leading-tight">
                    Job matching
                    <br />
                    without the noise
                  </h3>
                  <p className="text-zinc-500 leading-relaxed max-w-[48ch]">
                    Describe what you're looking for and Ruixen surfaces roles
                    that genuinely fit — not keyword spam. Every match comes
                    with a clear explanation of why it aligns with your
                    background and what to emphasize in your application.
                  </p>
                </div>
              </div>
            </FadeInSection>

            {/* Feature 3 */}
            <FadeInSection delay={0.05}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div>
                  <div className="w-8 h-px bg-zinc-950 mb-7" />
                  <h3 className="font-display text-3xl md:text-4xl font-light tracking-tight mb-5 leading-tight">
                    Interview prep
                    <br />
                    that's brutally honest
                  </h3>
                  <p className="text-zinc-500 leading-relaxed max-w-[48ch]">
                    Practice your answers and get direct, specific feedback —
                    not generic tips. Ruixen identifies exactly what's weak,
                    what sounds rehearsed, and how to reframe your experience
                    to match what interviewers are actually listening for.
                  </p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)]">
                  <InterviewVisual />
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section
        id="testimonials"
        className="py-32 bg-white border-t border-zinc-100"
      >
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16">
          <FadeInSection className="mb-16">
            <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 font-medium mb-4">
              Success stories
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight leading-tight">
              People who got
              <br />
              <span className="italic text-zinc-400">the job</span>
            </h2>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr_0.95fr] gap-5 items-start">
            <FadeInSection delay={0}>
              <TestimonialCard
                quote="I'd been applying for months with no callbacks. After one session revising my resume with Ruixen, I got three interview requests the following week. The rewrite was that different."
                name="Priya Nandakumar"
                role="Now Senior PM at Meridian Health"
                offsetClass=""
              />
            </FadeInSection>
            <FadeInSection delay={0.1}>
              <TestimonialCard
                quote="The job matching is eerily accurate. It found a fintech role I hadn't considered but was a perfect fit for my background. I started there six weeks later. I wouldn't have found it on my own."
                name="Tobias Vrenzel"
                role="Software Engineer, Axis Capital"
                offsetClass="md:mt-10"
              />
            </FadeInSection>
            <FadeInSection delay={0.2}>
              <TestimonialCard
                quote="The interview prep is incredibly honest. It told me exactly what sounded weak and how to fix it. Best coaching I've gotten — better than the $300/hr career coach I hired last year."
                name="Celeste Amaral"
                role="UX Researcher, Thornfield Studio"
                offsetClass="md:mt-4"
              />
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-40 bg-zinc-950 text-white">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 text-center">
          <FadeInSection>
            <p className="text-xs tracking-[0.2em] uppercase text-zinc-500 font-medium mb-6">
              Get started
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tight leading-tight mb-8">
              Ready to land
              <br />
              <span className="italic text-zinc-500">your next role?</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-[46ch] mx-auto mb-12 leading-relaxed">
              Paste your resume and start a conversation. Ruixen gives you the
              edge every job search needs — in minutes, not weeks.
            </p>
            <DirectionalButton
              onClick={onLaunchChat}
              fillClassName="bg-zinc-100"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-950 text-sm font-medium rounded-full active:scale-[0.98] active:-translate-y-[1px]"
            >
              Revise my resume
              <ArrowRight className="w-4 h-4" />
            </DirectionalButton>
          </FadeInSection>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-zinc-950 border-t border-zinc-800/60 py-12 text-zinc-500">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-display text-white text-base">Ruixen AI</span>
          <span className="text-xs text-zinc-600">
            {new Date().getFullYear()} — AI-powered career coaching
          </span>
          <div className="flex items-center gap-6 text-xs">
            <a
              href="#"
              className="hover:text-zinc-300 transition-colors duration-200"
            >
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-zinc-300 transition-colors duration-200"
            >
              Terms
            </a>
            <button
              onClick={onLaunchChat}
              className="hover:text-zinc-300 transition-colors duration-200"
            >
              Launch Chat
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

const WEAK_TEXT = "Responsible for managing social media accounts";
const STRONG_TEXT =
  "Grew Instagram 340% in 6 months, driving 47K new followers and a 4.2% engagement rate";

type RewritePhase =
  | "typing-weak"
  | "pause-weak"
  | "striking"
  | "typing-strong"
  | "pause-strong"
  | "resetting";

function RewriteAnimation() {
  const [phase, setPhase] = useState<RewritePhase>("typing-weak");
  const [weakChars, setWeakChars] = useState(0);
  const [strongChars, setStrongChars] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    if (phase === "typing-weak") {
      interval = setInterval(() => {
        setWeakChars((prev) => {
          if (prev >= WEAK_TEXT.length) {
            clearInterval(interval);
            timeout = setTimeout(() => setPhase("pause-weak"), 100);
            return prev;
          }
          return prev + 1;
        });
      }, 42);
    }

    if (phase === "pause-weak") {
      timeout = setTimeout(() => setPhase("striking"), 900);
    }

    if (phase === "striking") {
      timeout = setTimeout(() => setPhase("typing-strong"), 650);
    }

    if (phase === "typing-strong") {
      interval = setInterval(() => {
        setStrongChars((prev) => {
          if (prev >= STRONG_TEXT.length) {
            clearInterval(interval);
            timeout = setTimeout(() => setPhase("pause-strong"), 100);
            return prev;
          }
          return prev + 1;
        });
      }, 26);
    }

    if (phase === "pause-strong") {
      timeout = setTimeout(() => setPhase("resetting"), 2800);
    }

    if (phase === "resetting") {
      timeout = setTimeout(() => {
        setWeakChars(0);
        setStrongChars(0);
        setPhase("typing-weak");
      }, 350);
    }

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [phase]);

  const showWeak = phase !== "resetting";
  const isStriking =
    phase === "striking" ||
    phase === "typing-strong" ||
    phase === "pause-strong";
  const showStrong =
    phase === "typing-strong" || phase === "pause-strong";
  const showWeakCursor =
    phase === "typing-weak" || phase === "pause-weak";
  const showStrongCursor = phase === "typing-strong";
  const showBadge = phase === "pause-strong";

  return (
    <div className="animate-float">
      <div className="bg-white rounded-2xl border border-zinc-200/70 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.03)] p-6 max-w-sm">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-zinc-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
          <span className="text-xs text-zinc-400 tracking-wide">
            AI rewriting...
          </span>
        </div>

        <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-3">
          Resume bullet
        </p>

        <div className="min-h-[5rem]">
          {showWeak && (
            <p
              className={`text-sm leading-relaxed transition-all duration-500 ${
                isStriking ? "line-through text-zinc-300" : "text-zinc-600"
              }`}
            >
              {WEAK_TEXT.slice(0, weakChars)}
              {showWeakCursor && (
                <span className="inline-block w-0.5 h-3.5 bg-zinc-400 ml-0.5 animate-blink align-text-bottom" />
              )}
            </p>
          )}

          {showStrong && (
            <p className="text-sm leading-relaxed text-zinc-950 font-medium mt-3">
              {STRONG_TEXT.slice(0, strongChars)}
              {showStrongCursor && (
                <span className="inline-block w-0.5 h-3.5 bg-zinc-950 ml-0.5 animate-blink align-text-bottom" />
              )}
            </p>
          )}
        </div>

        <div
          className={`mt-4 pt-3 border-t border-zinc-100 transition-opacity duration-500 ${
            showBadge ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full font-medium">
            +3.1x more callbacks
          </span>
        </div>
      </div>
    </div>
  );
}

function ResumeVisual() {
  return (
    <div className="text-xs leading-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-red-400" />
        <span className="text-zinc-400 tracking-wide">Before</span>
      </div>
      <div className="space-y-1.5 pb-4 border-b border-zinc-100">
        {[
          "Responsible for managing product roadmap",
          "Worked with engineering on feature delivery",
          "Helped grow the user base",
        ].map((line) => (
          <div key={line} className="flex items-start gap-2 text-zinc-400">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-zinc-300 flex-shrink-0" />
            <span className="line-through decoration-zinc-300">{line}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
        <span className="text-zinc-400 tracking-wide">After</span>
      </div>
      <div className="space-y-1.5">
        {[
          "Defined and shipped roadmap for 4 core features, driving 31% retention lift",
          "Led cross-functional delivery for 6 engineers, cutting cycle time by 18 days",
          "Grew active user base from 12k to 47k in 8 months through targeted growth loops",
        ].map((line, i) => (
          <div
            key={line}
            className="flex items-start gap-2 text-zinc-700 animate-fade-in-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
            <span>{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function JobMatchVisual() {
  const matches = [
    { role: "Senior Product Manager", company: "Vanta", fit: "97%" },
    { role: "Director of Product", company: "Coda", fit: "91%" },
    { role: "Product Lead", company: "Retool", fit: "88%" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
        <span className="text-xs text-zinc-400 tracking-wide">
          3 strong matches found
        </span>
      </div>
      {matches.map((m, i) => (
        <div
          key={m.role}
          className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100 animate-fade-in-up"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div>
            <p className="text-sm font-medium text-zinc-900">{m.role}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{m.company}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-emerald-600">
              {m.fit}
            </span>
            <span className="text-xs text-zinc-400">match</span>
          </div>
        </div>
      ))}
      <div className="mt-2 flex items-center gap-2 pt-3 border-t border-zinc-100">
        <span className="text-xs text-zinc-400">
          Based on your experience and target role
        </span>
      </div>
    </div>
  );
}

function InterviewVisual() {
  return (
    <div className="text-[12px] leading-5 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-zinc-600" />
        <span className="text-xs text-zinc-500 tracking-wide">
          Interview practice
        </span>
      </div>

      <div className="space-y-3">
        <div className="text-zinc-400">
          <span className="text-zinc-600 font-medium">Q: </span>
          Tell me about a time you had to make a decision with incomplete data.
        </div>

        <div className="pl-3 border-l border-zinc-700 text-zinc-500 italic">
          "I usually just go with my gut and then see what happens after..."
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-amber-400 text-[11px] font-medium">
              Feedback
            </span>
          </div>
          <p className="text-zinc-400">
            This answer lacks structure and signals low confidence. Lead with
            the business context, then explain what data you had, what you
            inferred, and what the outcome was. Use the STAR format.
          </p>
          <p className="text-zinc-300 mt-2">
            <span className="text-emerald-400">Stronger opening: </span>
            "At [Company], we needed to decide on pricing before we had
            retention data. I used comparable cohorts and..."
          </p>
        </div>
      </div>
    </div>
  );
}

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  offsetClass: string;
}

function TestimonialCard({
  quote,
  name,
  role,
  offsetClass,
}: TestimonialCardProps) {
  return (
    <div
      className={`${offsetClass} bg-white border border-zinc-100 rounded-2xl p-7 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.06)]`}
    >
      <p className="text-zinc-500 text-sm leading-relaxed mb-7">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-medium text-zinc-500">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-950">{name}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{role}</p>
        </div>
      </div>
    </div>
  );
}
