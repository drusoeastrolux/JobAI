import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onLaunchChat: () => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Palette
   bg:       #F5F2EC  warm cream
   ink:      #1A1714  warm near-black
   sienna:   #BF4E30  terracotta accent
   muted:    #6B6560  warm gray
   border:   #E8E4DF  warm rule
───────────────────────────────────────────────────────────────────────────── */

export default function LandingPage({ onLaunchChat }: LandingPageProps) {
  const heroRef = useRef<HTMLElement>(null);

  /* ── Hero entrance ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });

      tl.from(".hero-meta", { opacity: 0, y: 14, duration: 0.65, ease: "power3.out" });

      // Line 1 — clip upward
      tl.to(".hero-line-inner", { translateY: "0%", duration: 1.0, ease: "power4.out" }, "-=0.2");

      // Line 2 — slide from left
      tl.to(".hero-line-slide-inner", { translateX: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, "-=0.65");

      // Line 3 — per-character spring
      tl.to(
        ".hero-letter",
        { opacity: 1, y: 0, rotate: 0, duration: 0.5, stagger: 0.036, ease: "back.out(1.4)" },
        "-=0.5"
      );

      tl.from(".hero-body", { opacity: 0, y: 20, duration: 0.85, stagger: 0.1, ease: "power3.out" }, "-=0.3");
      tl.from(".scroll-indicator", { opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.15");
    }, heroRef);
    return () => ctx.revert();
  }, []);

  /* ── Scroll reveals ───────────────────────────────────────────────────────── */
  useEffect(() => {
    const triggers = gsap.utils.toArray<HTMLElement>(".scroll-reveal");
    const tweens = triggers.map((el) =>
      gsap.fromTo(
        el,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.95,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
        }
      )
    );
    return () => { tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); }); };
  }, []);

  return (
    <div className="bg-[#F5F2EC] text-[#1A1714] overflow-x-hidden font-sans">

      {/* Grain overlay — fixed, pointer-none, never on scrolling containers */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.028]"
        style={{
          zIndex: 999,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "192px 192px",
        }}
      />

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-[100] bg-[#F5F2EC]/92 backdrop-blur-sm border-b border-[#1A1714]/8">
        <div className="flex justify-between items-center w-full px-10 lg:px-16 py-5 max-w-[1600px] mx-auto">

          <div className="font-headline italic text-xl text-[#1A1714] tracking-tight">
            Avenue
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {["Resume", "Cover Letter", "Interview", "Pricing"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[#6B6560] hover:text-[#1A1714] text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-8">
            <button className="text-[#6B6560] hover:text-[#1A1714] text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-200">
              Sign In
            </button>
            <button
              onClick={onLaunchChat}
              className="bg-[#1A1714] text-[#F5F2EC] px-7 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-[#BF4E30] active:scale-[0.98] transition-all duration-200"
            >
              Open Studio
            </button>
          </div>
        </div>
      </nav>

      <main>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          className="relative min-h-[100dvh] flex items-center pt-28 pb-28 px-10 lg:px-16 overflow-hidden bg-[#F5F2EC]"
        >
          <div className="max-w-[1600px] mx-auto w-full grid lg:grid-cols-12 gap-16 items-center">

            {/* Left: headline + body */}
            <div className="lg:col-span-7">

              <div className="hero-meta mb-10 flex items-center gap-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#BF4E30]">
                  Career Intelligence
                </span>
                <div className="w-16 h-px bg-[#BF4E30]/30" />
              </div>

              <h1 className="font-headline font-black mb-12" style={{ lineHeight: 0.88 }}>
                {/* Line 1 — clip-up */}
                <span className="hero-line block overflow-hidden">
                  <span className="hero-line-inner block text-[clamp(2.8rem,5.8vw,7rem)] tracking-[-0.04em] text-[#1A1714]">
                    Land Your Next
                  </span>
                </span>

                {/* Line 2 — slide from left */}
                <span className="hero-line-slide block overflow-hidden">
                  <span className="hero-line-slide-inner block text-[clamp(2.8rem,5.8vw,7rem)] tracking-[-0.04em] text-[#1A1714]">
                    Role with
                  </span>
                </span>

                {/* Line 3 — per-character spring */}
                <span
                  className="block italic text-[#BF4E30] text-[clamp(2.8rem,5.8vw,7rem)] tracking-[-0.04em]"
                  aria-label="Precision AI"
                >
                  {"Precision AI".split("").map((char, i) => (
                    <span key={i} className="hero-letter">
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </span>
              </h1>

              <div className="hero-body flex flex-col sm:flex-row items-start gap-10 max-w-xl">
                <p className="text-base text-[#6B6560] leading-relaxed font-light max-w-[50ch]">
                  Paste your resume, paste the job description. Get a rewritten resume that
                  clears ATS filters, matches the role, and gets you more interviews.
                </p>
                <button
                  onClick={onLaunchChat}
                  className="shrink-0 bg-[#BF4E30] text-white px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] hover:bg-[#A33E22] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_20px_rgba(191,78,48,0.25)]"
                >
                  Start Now
                </button>
              </div>
            </div>

            {/* Right: resume-analysis artifact */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#E8E4DF] shadow-[0_8px_40px_rgba(26,23,20,0.07)] overflow-hidden">

                {/* File bar */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E8E4DF] bg-[#F5F2EC]/60">
                  <span className="text-[10px] font-mono text-[#9E9892] tracking-wider">resume_2024.pdf</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#BF4E30] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#BF4E30] animate-pulse" />
                    Analyzing
                  </span>
                </div>

                {/* Resume body */}
                <div className="p-6 space-y-5">
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-40 bg-[#1A1714]/85 rounded-sm" />
                    <div className="h-1.5 w-28 bg-[#1A1714]/15 rounded-sm" />
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#BF4E30]">Experience</div>
                    {/* Weak line — flagged */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-1.5 bg-[#BF4E30]/12 rounded-sm relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 w-4/5 bg-[#BF4E30]/25 rounded-sm" />
                      </div>
                      <span className="shrink-0 text-[8px] font-semibold text-[#BF4E30] uppercase tracking-wider">weak</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1A1714]/6 rounded-sm" />
                    <div className="h-1.5 w-11/12 bg-[#1A1714]/6 rounded-sm" />
                    <div className="h-1.5 w-3/4 bg-[#1A1714]/6 rounded-sm" />
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9E9892]">Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {["TypeScript", "React", "Node.js", "Figma"].map((s) => (
                        <span key={s} className="text-[8px] px-2 py-0.5 border border-[#E8E4DF] text-[#6B6560] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI suggestion bar */}
                <div className="mx-4 mb-4 flex items-start gap-3 p-4 bg-[#F5F2EC] border border-[#E8E4DF]">
                  <div className="w-[3px] self-stretch bg-[#BF4E30] shrink-0" />
                  <div>
                    <div className="text-[9px] font-semibold text-[#1A1714] mb-1 uppercase tracking-[0.15em]">Suggested rewrite</div>
                    <div className="text-[10px] text-[#6B6560] leading-relaxed">
                      "Migrated REST API to GraphQL, cutting median load time by 340ms across 2.1M monthly users."
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5">
            <span className="text-[9px] font-medium uppercase tracking-[0.35em] text-[#1A1714]/25">scroll</span>
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" className="text-[#1A1714]/20">
              <path d="M7 0v14M1 9l6 7 6-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </section>

        {/* ── STATS STRIP ───────────────────────────────────────────────────── */}
        <section className="bg-[#1A1714] py-16 px-10 lg:px-16">
          <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/8">
              {[
                { number: "2,847",  label: "resumes rewritten this week" },
                { number: "73%",    label: "get an interview within 3 weeks" },
                { number: "4.8 ★", label: "average from 1,200+ reviews" },
              ].map(({ number, label }) => (
                <div key={label} className="scroll-reveal px-0 md:px-14 first:pl-0 last:pr-0 py-8 md:py-0">
                  <div className="font-headline italic text-4xl text-[#BF4E30] mb-1 tracking-tight">{number}</div>
                  <div className="text-[10px] font-medium text-white/35 uppercase tracking-[0.18em]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES — zig-zag, not 3-col ─────────────────────────────────── */}
        <section id="features" className="px-10 lg:px-16 py-36 bg-[#F5F2EC]">
          <div className="max-w-[1600px] mx-auto space-y-36">

            {/* Header */}
            <div className="scroll-reveal border-t border-[#1A1714]/10 pt-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <h2 className="font-headline font-black text-5xl lg:text-7xl tracking-tighter leading-[0.88] text-[#1A1714]">
                What it does.
              </h2>
              <span className="text-[11px] font-medium text-[#6B6560] uppercase tracking-[0.18em] max-w-xs lg:text-right leading-relaxed">
                Three tools. One conversation. No forms.
              </span>
            </div>

            {/* Feature 01 — text left, artifact right */}
            <div className="scroll-reveal grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
              <div className="lg:col-span-5 lg:pt-6">
                <div className="text-[10px] font-semibold text-[#BF4E30] uppercase tracking-[0.28em] mb-5">01 — Resume</div>
                <h3 className="font-headline font-black text-4xl lg:text-5xl tracking-tighter leading-[0.9] text-[#1A1714] mb-5">
                  Rewrites that clear the filter.
                </h3>
                <p className="text-[15px] text-[#6B6560] leading-relaxed font-light max-w-[42ch]">
                  ATS systems reject 75% of resumes before a human reads them. Avenue rewrites
                  yours to match the exact language the role uses — without sounding like a template.
                </p>
              </div>
              <div className="lg:col-span-7">
                {/* Before / After artifact */}
                <div className="bg-white border border-[#E8E4DF] shadow-[0_4px_24px_rgba(26,23,20,0.05)] overflow-hidden">
                  <div className="flex border-b border-[#E8E4DF]">
                    <div className="flex-1 px-5 py-3 border-r border-[#E8E4DF]">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9E9892]">Before</span>
                    </div>
                    <div className="flex-1 px-5 py-3 bg-[#F5F2EC]/50">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#BF4E30]">After</span>
                    </div>
                  </div>
                  <div className="flex divide-x divide-[#E8E4DF]">
                    <div className="flex-1 p-5">
                      <p className="text-[11px] text-[#9E9892] leading-relaxed line-through decoration-[#BF4E30]/30 decoration-1">
                        "Worked on API improvements that made things faster for users across the platform."
                      </p>
                    </div>
                    <div className="flex-1 p-5 bg-[#F5F2EC]/40">
                      <p className="text-[11px] text-[#1A1714] leading-relaxed font-medium">
                        "Migrated REST endpoints to GraphQL, cutting median load time by 340ms for 2.1M monthly users."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 02 — artifact left, text right */}
            <div className="scroll-reveal grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
              <div className="lg:col-span-6 order-2 lg:order-1">
                {/* Cover letter typing artifact */}
                <div className="bg-white border border-[#E8E4DF] shadow-[0_4px_24px_rgba(26,23,20,0.05)] p-6">
                  <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9E9892] mb-5 pb-4 border-b border-[#E8E4DF]">
                    Cover Letter — Draft 1
                  </div>
                  <div className="space-y-3 text-[11px] text-[#1A1714] leading-[1.7]">
                    <p>
                      I'm applying for the Senior Product Designer role at Stripe because I've
                      spent four years obsessing over the same problem you're solving:
                    </p>
                    <p>making complex financial interactions feel effortless.</p>
                    <p className="flex items-center gap-1.5 text-[#BF4E30]">
                      <span className="w-1.5 h-[14px] bg-[#BF4E30] animate-pulse inline-block" />
                    </p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6 order-1 lg:order-2 lg:pt-6">
                <div className="text-[10px] font-semibold text-[#BF4E30] uppercase tracking-[0.28em] mb-5">02 — Cover Letter</div>
                <h3 className="font-headline font-black text-4xl lg:text-5xl tracking-tighter leading-[0.9] text-[#1A1714] mb-5">
                  Your voice, not a template.
                </h3>
                <p className="text-[15px] text-[#6B6560] leading-relaxed font-light max-w-[42ch]">
                  Avenue reads the job description and your resume, then writes a letter
                  that sounds like you — specific to the company, specific to the role.
                </p>
              </div>
            </div>

            {/* Feature 03 — full-width horizontal bar */}
            <div className="scroll-reveal border-t border-[#1A1714]/10 pt-14">
              <div className="grid lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-4">
                  <div className="text-[10px] font-semibold text-[#BF4E30] uppercase tracking-[0.28em] mb-4">03 — Interview</div>
                  <h3 className="font-headline font-black text-4xl tracking-tighter leading-[0.9] text-[#1A1714]">
                    Practice until it lands.
                  </h3>
                </div>
                <div className="lg:col-span-4">
                  <p className="text-[15px] text-[#6B6560] leading-relaxed font-light">
                    Get the 12 questions this company actually asks. Answer them. Receive
                    line-by-line feedback on clarity, specificity, and tone.
                  </p>
                </div>
                <div className="lg:col-span-4">
                  <div className="bg-white border border-[#E8E4DF] shadow-[0_4px_24px_rgba(26,23,20,0.05)] p-5">
                    <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9E9892] mb-4">Last answer scored</div>
                    <div className="space-y-3">
                      {[
                        { label: "Specificity", val: 87 },
                        { label: "Clarity",     val: 72 },
                        { label: "Relevance",   val: 94 },
                      ].map(({ label, val }) => (
                        <div key={label}>
                          <div className="flex justify-between text-[9px] font-medium text-[#6B6560] mb-1">
                            <span>{label}</span>
                            <span className="text-[#1A1714] font-semibold">{val}</span>
                          </div>
                          <div className="h-[3px] bg-[#E8E4DF] overflow-hidden">
                            <div className="h-full bg-[#BF4E30]" style={{ width: `${val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── PROCESS — sticky layout ────────────────────────────────────────── */}
        <section id="method" className="py-44 bg-[#EDEAE4] relative overflow-hidden">
          <div className="max-w-[1600px] mx-auto px-10 lg:px-16 grid lg:grid-cols-12 gap-20">

            {/* Sticky left */}
            <div className="lg:col-span-5 sticky top-32 self-start scroll-reveal">
              <div className="text-[10px] font-semibold text-[#BF4E30] uppercase tracking-[0.28em] mb-8">How it works</div>
              <h2 className="font-headline font-black text-6xl lg:text-8xl tracking-tighter uppercase leading-[0.85] text-[#1A1714] mb-8">
                Three<br />steps.
              </h2>
              <div className="h-px bg-[#1A1714]/12 mb-8" />
              <p className="text-[15px] text-[#6B6560] font-light leading-relaxed max-w-[30ch]">
                No account required. No onboarding. Paste and go.
              </p>
            </div>

            {/* Step cards */}
            <div className="lg:col-span-7 space-y-10">
              {[
                {
                  n: "01",
                  title: "Paste your resume",
                  body: "Drop in your current resume as plain text. No formatting required — Avenue reads content, not layout.",
                },
                {
                  n: "02",
                  title: "Paste the job posting",
                  body: "Paste the full job description. The more specific the posting, the more targeted the rewrite.",
                },
                {
                  n: "03",
                  title: "Get your rewrite",
                  body: "A rewritten resume, a targeted cover letter, and the exact phrases the ATS will scan for.",
                },
              ].map(({ n, title, body }) => (
                <div key={n} className="scroll-reveal flex gap-8 items-start">
                  <span className="font-headline italic text-5xl text-[#BF4E30]/20 leading-none shrink-0 mt-1">{n}</span>
                  <div className="bg-white border border-[#E8E4DF] p-8 flex-1 shadow-[0_2px_16px_rgba(26,23,20,0.04)]">
                    <h4 className="font-headline font-black text-2xl tracking-tight text-[#1A1714] mb-3">{title}</h4>
                    <p className="text-sm text-[#6B6560] leading-relaxed font-light">{body}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── CTA — left-aligned, no neon glow ──────────────────────────────── */}
        <section className="py-44 px-10 lg:px-16 bg-[#1A1714]">
          <div className="max-w-[1600px] mx-auto scroll-reveal">
            <div className="max-w-4xl">
              <div className="text-[10px] font-semibold text-[#BF4E30] uppercase tracking-[0.28em] mb-10">
                Stop guessing
              </div>
              <h2 className="font-headline font-black tracking-tighter leading-[0.85] text-[#F5F2EC] mb-12"
                style={{ fontSize: "clamp(3rem, 7vw, 8rem)" }}
              >
                The version of you<br />
                that <span className="italic text-[#BF4E30]">gets hired.</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <button
                  onClick={onLaunchChat}
                  className="bg-[#BF4E30] text-white px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] hover:bg-[#A33E22] active:scale-[0.98] transition-all duration-200"
                >
                  Open the Studio
                </button>
                <div className="flex items-center gap-5 text-[10px] font-medium text-white/20 uppercase tracking-[0.18em] pt-3.5">
                  <span>No signup</span>
                  <span className="w-1 h-1 rounded-full bg-white/15" />
                  <span>No credit card</span>
                  <span className="w-1 h-1 rounded-full bg-white/15" />
                  <span>Instant output</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="bg-[#F5F2EC] border-t border-[#1A1714]/8 px-10 lg:px-16 py-20">
        <div className="max-w-[1600px] mx-auto grid md:grid-cols-12 gap-16 items-start">

          <div className="md:col-span-4">
            <div className="font-headline italic text-2xl text-[#1A1714] mb-4 tracking-tight">Avenue</div>
            <p className="text-[10px] font-medium text-[#9E9892] uppercase tracking-[0.18em] leading-loose max-w-xs">
              Career intelligence for people who write their own story.
            </p>
          </div>

          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1A1714]">Product</div>
              {["Resume", "Cover Letter", "Interview Prep", "ATS Check"].map((l) => (
                <a key={l} href="#" className="block text-[10px] font-medium text-[#9E9892] hover:text-[#1A1714] uppercase tracking-[0.12em] transition-colors duration-150">
                  {l}
                </a>
              ))}
            </div>
            <div className="space-y-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1A1714]">Legal</div>
              {["Privacy", "Terms", "Cookies"].map((l) => (
                <a key={l} href="#" className="block text-[10px] font-medium text-[#9E9892] hover:text-[#1A1714] uppercase tracking-[0.12em] transition-colors duration-150">
                  {l}
                </a>
              ))}
            </div>
            <div className="space-y-4 col-span-2 md:col-span-1">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1A1714]">Updates</div>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-transparent border-b border-[#1A1714]/15 py-2 text-[11px] text-[#1A1714] placeholder:text-[#9E9892] focus:outline-none focus:border-[#BF4E30] transition-colors duration-200"
              />
            </div>
          </div>

        </div>

        <div className="max-w-[1600px] mx-auto mt-16 pt-8 border-t border-[#1A1714]/8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[9px] font-medium text-[#9E9892] uppercase tracking-[0.35em]">
            © 2024 Avenue. All rights reserved.
          </div>
          <div className="text-[9px] font-medium text-[#9E9892] uppercase tracking-[0.35em]">
            London &amp; San Francisco
          </div>
        </div>
      </footer>

    </div>
  );
}
