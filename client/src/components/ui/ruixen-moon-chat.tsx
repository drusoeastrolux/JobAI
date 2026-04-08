import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowUpIcon,
  ArrowDownIcon,
  StopCircle,
  FileText,
  Briefcase,
  MessageSquare,
  PenLine,
  Search,
  ClipboardCheck,
  X,
  Check,
  Link,
  SquarePen,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

interface AutoResizeProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }
      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current)
      textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

interface RuixenMoonChatProps {
  onBack?: () => void;
}

const quickActions = [
  {
    icon: FileText,
    label: "Revise my resume",
    prompt:
      "I'd like help revising my resume. Let me paste it and tell you the role I'm targeting.",
  },
  {
    icon: Briefcase,
    label: "Find matching jobs",
    prompt:
      "Can you help me find job roles that match my background? I'll describe my experience and what I'm looking for.",
  },
  {
    icon: MessageSquare,
    label: "Prep for an interview",
    prompt:
      "I have an upcoming interview and want to practice. Can you give me likely questions for my role and give feedback on my answers?",
  },
  {
    icon: PenLine,
    label: "Write a cover letter",
    prompt:
      "Help me write a cover letter. I'll share the job description and my resume.",
  },
  {
    icon: Search,
    label: "Optimize for ATS",
    prompt:
      "I want to optimize my resume for ATS systems. Can you analyze it and suggest improvements?",
  },
  {
    icon: ClipboardCheck,
    label: "Review a job posting",
    prompt:
      "I found a job posting I'm interested in. Can you help me assess my fit and identify what to emphasize in my application?",
  },
];

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function renderMessageContent(content: string) {
  const parts = content.split(URL_REGEX);
  return parts.map((part, i) => {
    if (URL_REGEX.test(part)) {
      URL_REGEX.lastIndex = 0;
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-600 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-950 hover:decoration-zinc-500 transition-colors duration-150 break-all"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function formatTime(ts?: number): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3_600_000)}h ago`;
}

const STORAGE_KEY = "ruixen_chat_history";
const RESUME_KEY = "ruixen_resume";
const JOB_KEY = "ruixen_job_posting";

const GREETING: Message = {
  role: "assistant",
  content:
    "Paste your resume, share a job posting, or tell me what you're working on — I'll help you stand out.",
  timestamp: Date.now(),
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function RuixenMoonChat({ onBack }: RuixenMoonChatProps) {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<Message[]>(() =>
    loadFromStorage<Message[]>(STORAGE_KEY, [GREETING])
  );
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const [chatKey, setChatKey] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const [resume, setResumeState] = useState<string>(() =>
    loadFromStorage<string>(RESUME_KEY, "")
  );
  const [resumeDraft, setResumeDraft] = useState("");
  const [showResumeModal, setShowResumeModal] = useState(false);

  const [jobPosting, setJobPostingState] = useState<string>(() =>
    loadFromStorage<string>(JOB_KEY, "")
  );
  const [jobPostingDraft, setJobPostingDraft] = useState("");
  const [showJobModal, setShowJobModal] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const setResume = (val: string) => {
    setResumeState(val);
    localStorage.setItem(RESUME_KEY, JSON.stringify(val));
  };

  const setJobPosting = (val: string) => {
    setJobPostingState(val);
    localStorage.setItem(JOB_KEY, JSON.stringify(val));
  };

  const clearHistory = () => {
    const freshGreeting = { ...GREETING, timestamp: Date.now() };
    setHistory([freshGreeting]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([freshGreeting]));
    setChatKey((k) => k + 1);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const isNearBottomRef = useRef(true);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 160,
  });

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distFromBottom < 220;
    isNearBottomRef.current = nearBottom;
    setShowScrollBtn(!nearBottom);
  }, []);

  useEffect(() => {
    if (isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, streamingContent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBtn(false);
  };

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      setError("");
      const userMessage: Message = {
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };
      const updatedHistory = [...history, userMessage];
      setHistory(updatedHistory);
      setMessage("");
      adjustHeight(true);
      setIsStreaming(true);
      setStreamingContent("");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedHistory,
            ...(resume ? { resumeContext: resume } : {}),
            ...(jobPosting ? { jobContext: jobPosting } : {}),
          }),
        });

        if (!res.ok) {
          const err = await res
            .json()
            .catch(() => ({ error: res.statusText }));
          throw new Error(err.error ?? res.statusText);
        }

        const reader = res.body!.getReader();
        readerRef.current = reader;
        const decoder = new TextDecoder();
        let accumulated = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.content) {
                accumulated += parsed.content;
                setStreamingContent(accumulated);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }

        setHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            content: accumulated,
            timestamp: Date.now(),
          },
        ]);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const msg =
          err instanceof Error ? err.message : "Something went wrong";
        setError(msg);
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
        readerRef.current = null;
      }
    },
    [history, isStreaming, adjustHeight, resume, jobPosting]
  );

  const handleStop = () => {
    readerRef.current?.cancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(message);
    }
  };

  const openResumeModal = () => {
    setResumeDraft(resume);
    setShowResumeModal(true);
  };

  const saveResume = () => {
    setResume(resumeDraft.trim());
    setShowResumeModal(false);
  };

  const removeResume = () => {
    setResume("");
    setResumeDraft("");
    setShowResumeModal(false);
  };

  const openJobModal = () => {
    setJobPostingDraft(jobPosting);
    setShowJobModal(true);
  };

  const saveJobPosting = () => {
    setJobPosting(jobPostingDraft.trim());
    setShowJobModal(false);
  };

  const removeJobPosting = () => {
    setJobPosting("");
    setJobPostingDraft("");
    setShowJobModal(false);
  };

  return (
    <div className="min-h-[100dvh] bg-[#fafaf9] font-sans flex flex-col">

      {/* ── Grain overlay ────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* ── Ambient glow ─────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none isolate overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div className="animate-orb-1 absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[320px] rounded-full bg-amber-200 opacity-25 blur-[80px] mix-blend-multiply" />
        <div className="animate-orb-2 absolute -top-24 left-1/3 w-[480px] h-[280px] rounded-full bg-emerald-100 opacity-20 blur-[80px] mix-blend-multiply" />
      </div>

      {/* ── Resume Modal ─────────────────────────────────────────────────── */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-950/20 backdrop-blur-sm"
            onClick={() => setShowResumeModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.04)] w-full max-w-2xl flex flex-col max-h-[80dvh]">
            <div className="flex items-center justify-between px-7 py-5 border-b border-zinc-100">
              <div>
                <h3 className="font-display text-xl font-medium tracking-tight text-zinc-950">
                  Your Resume
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                  Paste your resume — Ruixen will reference it in every response.
                </p>
              </div>
              <button
                onClick={() => setShowResumeModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all duration-200"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            <textarea
              value={resumeDraft}
              onChange={(e) => setResumeDraft(e.target.value)}
              placeholder="Paste your full resume here..."
              className="flex-1 w-full px-7 py-5 text-sm text-zinc-800 bg-transparent resize-none focus:outline-none placeholder:text-zinc-300 leading-relaxed min-h-[300px] font-sans"
              autoFocus
            />
            <div className="flex items-center justify-between px-7 py-4 border-t border-zinc-100">
              {resume ? (
                <button
                  onClick={removeResume}
                  className="text-xs text-zinc-400 hover:text-rose-500 transition-colors duration-200 font-sans"
                >
                  Remove resume
                </button>
              ) : (
                <span />
              )}
              <button
                onClick={saveResume}
                disabled={!resumeDraft.trim()}
                className={cn(
                  "flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-medium transition-all duration-200 active:scale-[0.98] font-sans",
                  resumeDraft.trim()
                    ? "bg-zinc-950 text-white hover:bg-zinc-800"
                    : "bg-zinc-100 text-zinc-300 cursor-not-allowed"
                )}
              >
                <Check className="w-3.5 h-3.5" strokeWidth={2} />
                Save resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Job Posting Modal ─────────────────────────────────────────────── */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-950/20 backdrop-blur-sm"
            onClick={() => setShowJobModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.04)] w-full max-w-2xl flex flex-col max-h-[80dvh]">
            <div className="flex items-center justify-between px-7 py-5 border-b border-zinc-100">
              <div>
                <h3 className="font-display text-xl font-medium tracking-tight text-zinc-950">
                  Job Posting
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                  Paste the job description — Ruixen will tailor all advice to
                  this role.
                </p>
              </div>
              <button
                onClick={() => setShowJobModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all duration-200"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            <textarea
              value={jobPostingDraft}
              onChange={(e) => setJobPostingDraft(e.target.value)}
              placeholder="Paste the full job description here..."
              className="flex-1 w-full px-7 py-5 text-sm text-zinc-800 bg-transparent resize-none focus:outline-none placeholder:text-zinc-300 leading-relaxed min-h-[300px] font-sans"
              autoFocus
            />
            <div className="flex items-center justify-between px-7 py-4 border-t border-zinc-100">
              {jobPosting ? (
                <button
                  onClick={removeJobPosting}
                  className="text-xs text-zinc-400 hover:text-rose-500 transition-colors duration-200 font-sans"
                >
                  Remove job posting
                </button>
              ) : (
                <span />
              )}
              <button
                onClick={saveJobPosting}
                disabled={!jobPostingDraft.trim()}
                className={cn(
                  "flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-medium transition-all duration-200 active:scale-[0.98] font-sans",
                  jobPostingDraft.trim()
                    ? "bg-zinc-950 text-white hover:bg-zinc-800"
                    : "bg-zinc-100 text-zinc-300 cursor-not-allowed"
                )}
              >
                <Check className="w-3.5 h-3.5" strokeWidth={2} />
                Save job posting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 bg-[#fafaf9]/90 backdrop-blur-md border-b border-zinc-100">
        <div className="flex items-center gap-5">
          {onBack && (
            <>
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-zinc-400 text-xs hover:text-zinc-950 transition-colors duration-200 font-sans"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <span className="text-zinc-200 select-none">|</span>
            </>
          )}
          <span className="font-display text-xl font-medium tracking-tight text-zinc-950">
            Ruixen AI
          </span>
          <span className="hidden sm:block text-xs text-zinc-400 font-sans tracking-wide">
            Career Coach
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={clearHistory}
            disabled={isStreaming}
            className="flex items-center gap-1.5 text-zinc-400 text-xs hover:text-zinc-950 transition-colors duration-200 disabled:opacity-40 font-sans"
          >
            <SquarePen className="w-3.5 h-3.5" />
            New chat
          </button>
        </div>
      </header>

      {/* ── Messages ─────────────────────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative z-[1]"
      >
        <div className="max-w-3xl mx-auto px-4 w-full">
          <div key={chatKey} className="flex flex-col gap-6 py-10">

            {history.map((msg, i) => {

              /* ── Greeting — centered welcome ── */
              if (i === 0 && msg.role === "assistant") {
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center text-center pt-8 pb-4 px-4 animate-fade-in-up"
                  >
                    <div className="w-12 h-12 rounded-full bg-zinc-950 flex items-center justify-center mb-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <span className="font-display text-base font-medium text-white leading-none">
                        R
                      </span>
                    </div>
                    <p className="font-display text-2xl font-light tracking-tight text-zinc-950 mb-3">
                      Ruixen AI
                    </p>
                    <p className="text-sm text-zinc-500 max-w-[40ch] leading-relaxed font-sans">
                      {msg.content}
                    </p>
                  </div>
                );
              }

              /* ── Regular message bubbles ── */
              return (
                <div
                  key={i}
                  className={cn(
                    "group flex gap-3 w-full animate-fade-in-up",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                  style={{
                    animationDelay: `${Math.min(i * 0.04, 0.3)}s`,
                  }}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-zinc-950 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.2)]">
                      <span className="font-display text-[10px] font-medium text-white leading-none">
                        R
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1 max-w-[78%]">
                    <div
                      className={cn(
                        "px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                        msg.role === "user"
                          ? "bg-zinc-950 text-white rounded-[18px] rounded-br-[5px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.25)]"
                          : "bg-white border border-zinc-100 text-zinc-700 rounded-[18px] rounded-bl-[5px] shadow-[0_2px_16px_-6px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)]"
                      )}
                    >
                      {msg.role === "assistant"
                        ? renderMessageContent(msg.content)
                        : msg.content}
                    </div>

                    {/* Timestamp — visible on group hover */}
                    <span
                      className={cn(
                        "text-[10px] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-sans",
                        msg.role === "user" ? "text-right" : "text-left pl-1"
                      )}
                    >
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>

                  {msg.role === "user" && (
                    <div className="w-7 h-7 flex-shrink-0" />
                  )}
                </div>
              );
            })}

            {/* ── Quick actions ── */}
            {history.length === 1 && !isStreaming && (
              <div className="flex flex-wrap gap-2 justify-center pt-2 animate-fade-in-up delay-200">
                {quickActions.map((action, i) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => sendMessage(action.prompt)}
                    className="flex items-center gap-2 px-4 py-2.5 text-zinc-500 text-xs font-medium rounded-xl border border-zinc-150 bg-white hover:border-zinc-300 hover:text-zinc-900 hover:bg-zinc-50 hover:shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] transition-all duration-200 active:scale-[0.98] shadow-[0_1px_3px_-1px_rgba(0,0,0,0.04)]"
                    style={{ animationDelay: `${0.25 + i * 0.05}s` }}
                  >
                    <action.icon
                      className="w-3.5 h-3.5 flex-shrink-0"
                      strokeWidth={1.5}
                    />
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* ── Streaming response ── */}
            {isStreaming && (
              <div className="flex gap-3 justify-start animate-fade-in-up">
                <div className="w-7 h-7 rounded-full bg-zinc-950 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.2)]">
                  <span className="font-display text-[10px] font-medium text-white leading-none">
                    R
                  </span>
                </div>
                <div className="max-w-[78%] px-4 py-3 rounded-[18px] rounded-bl-[5px] text-sm leading-relaxed bg-white border border-zinc-100 text-zinc-700 shadow-[0_2px_16px_-6px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)]">
                  {streamingContent || (
                    <span className="flex gap-1.5 items-center h-5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                  {streamingContent && (
                    <span className="inline-block w-0.5 h-3.5 bg-zinc-400 ml-0.5 animate-blink align-text-bottom" />
                  )}
                </div>
              </div>
            )}

            {/* ── Error state ── */}
            {error && (
              <div className="text-center text-zinc-500 text-sm bg-white border border-zinc-200 rounded-xl px-5 py-3 max-w-md mx-auto shadow-[0_2px_8px_-4px_rgba(0,0,0,0.06)] font-sans">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* ── Scroll to bottom button ───────────────────────────────────────── */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-28 right-6 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white border border-zinc-200 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.12)] text-zinc-500 hover:text-zinc-950 hover:border-zinc-400 transition-all duration-200 animate-fade-in-up"
        >
          <ArrowDownIcon className="w-4 h-4" strokeWidth={1.5} />
        </button>
      )}

      {/* ── Input area ───────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 bg-[#fafaf9]/90 backdrop-blur-md border-t border-zinc-100 relative z-[1]">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Paste your resume, describe a role, or ask anything..."
              disabled={isStreaming}
              className={cn(
                "w-full px-5 pt-4 pb-1 resize-none border-none",
                "bg-transparent text-zinc-900 text-sm font-sans",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-zinc-300 min-h-[48px]",
                "disabled:opacity-50"
              )}
              style={{ overflow: "hidden" }}
            />

            <div className="flex items-center justify-between px-4 pb-3">
              {/* Resume + Job posting buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={openResumeModal}
                  disabled={isStreaming}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-40 font-sans",
                    resume
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 border border-transparent hover:border-zinc-200"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {resume ? "Resume added" : "Add resume"}
                </button>

                <button
                  type="button"
                  onClick={openJobModal}
                  disabled={isStreaming}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-40 font-sans",
                    jobPosting
                      ? "bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100"
                      : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 border border-transparent hover:border-zinc-200"
                  )}
                >
                  <Link className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {jobPosting ? "Job added" : "Add job posting"}
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Shift + Enter hint — fades in while typing */}
                {message.length > 0 && !isStreaming && (
                  <span className="text-[10px] text-zinc-300 font-sans animate-fade-in-up select-none">
                    Shift + Enter for new line
                  </span>
                )}

                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 text-zinc-500 text-xs font-medium hover:border-zinc-400 hover:text-zinc-950 transition-all duration-200 active:scale-[0.98] font-sans"
                  >
                    <StopCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Stop
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => sendMessage(message)}
                    disabled={!message.trim()}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 active:scale-[0.97]",
                      message.trim()
                        ? "bg-zinc-950 text-white hover:bg-zinc-800 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)]"
                        : "bg-zinc-100 text-zinc-300 cursor-not-allowed"
                    )}
                  >
                    <ArrowUpIcon className="w-4 h-4" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
